<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Negotiation;
use App\Services\TransactionLifecycleService;
use Cloudinary\Cloudinary as CloudinarySdk;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class ChatMessageController extends Controller
{
    /**
     * Store a new chat message or offer.
     */
    public function store(Request $request, Negotiation $negotiation): RedirectResponse
    {
        $user = Auth::user();
        $userId = $user->id;

        if ($negotiation->buyer_id !== $userId && $negotiation->seller_id !== $userId) {
            abort(403, 'Anda tidak memiliki akses ke negosiasi ini.');
        }

        $request->validate([
            'message_type' => 'required|in:text,image,offer',
            'message' => 'nullable|string',
            'offer_price' => 'nullable|numeric|min:0',
            'offer_quantity' => 'nullable|integer|min:1',
            'image' => 'nullable|image|max:2048',
        ]);

        $status = TransactionLifecycleService::getStatus($negotiation);
        $isSeller = $user->isSeller();
        $permissions = $isSeller
            ? TransactionLifecycleService::getSellerPermissions($status)
            : TransactionLifecycleService::getBuyerPermissions($status);

        if (! $permissions['can_chat']) {
            return back()->withErrors(['message' => 'Transaksi ini telah '.$status.'. Anda tidak dapat mengirim pesan lagi.']);
        }

        if ($request->message_type === 'offer') {
            if (! $permissions['can_offer']) {
                return back()->withErrors(['message' => 'Penawaran baru tidak dapat dibuat pada status transaksi saat ini.']);
            }

            if (! $request->offer_price || ! $request->offer_quantity) {
                return back()->withErrors(['offer_price' => 'Harga dan kuantitas penawaran wajib diisi.']);
            }

            ChatMessage::create([
                'negotiation_id' => $negotiation->id,
                'sender_id' => $userId,
                'message_type' => 'offer',
                'offer_price' => $request->offer_price,
                'offer_quantity' => $request->offer_quantity,
                'offer_status' => 'pending',
                'created_at' => now(),
            ]);
        } elseif ($request->message_type === 'image' && $request->hasFile('image')) {
            $cloudinary = new CloudinarySdk(config('cloudinary.cloud_url'));
            $response = $cloudinary->uploadApi()->upload(
                $request->file('image')->getRealPath(),
                ['folder' => 'chat_images']
            );

            ChatMessage::create([
                'negotiation_id' => $negotiation->id,
                'sender_id' => $userId,
                'message_type' => 'image',
                'image_url' => $response['secure_url'],
                'message' => $request->message,
                'created_at' => now(),
            ]);
        } else {
            if (! trim($request->message)) {
                return back()->withErrors(['message' => 'Pesan tidak boleh kosong.']);
            }

            ChatMessage::create([
                'negotiation_id' => $negotiation->id,
                'sender_id' => $userId,
                'message_type' => 'text',
                'message' => $request->message,
                'created_at' => now(),
            ]);
        }

        $negotiation->touch();

        // Invalidate navbar badge cache for both participants so counts refresh
        Cache::forget("navbar_counts_{$negotiation->buyer_id}");
        Cache::forget("navbar_counts_{$negotiation->seller_id}");

        return back();
    }

    /**
     * Accept a pending offer.
     */
    public function acceptOffer(Request $request, Negotiation $negotiation, ChatMessage $chatMessage): RedirectResponse
    {
        $userId = Auth::id();

        if ($negotiation->buyer_id !== $userId && $negotiation->seller_id !== $userId) {
            abort(403);
        }

        if ($chatMessage->negotiation_id !== $negotiation->id || $chatMessage->message_type !== 'offer' || $chatMessage->offer_status !== 'pending') {
            return back()->withErrors(['message' => 'Penawaran ini tidak valid untuk diterima.']);
        }

        // Update offer status
        $chatMessage->update(['offer_status' => 'accepted']);

        // Update negotiation status and agreed values
        $negotiation->update([
            'agreed_price' => $chatMessage->offer_price,
            'agreed_quantity' => $chatMessage->offer_quantity,
            'status' => 'agreed',
        ]);

        // Add system message
        $negotiation->messages()->create([
            'sender_id' => $userId,
            'message_type' => 'system',
            'message' => 'Penawaran Rp '.number_format($chatMessage->offer_price, 0, ',', '.').' ('.$chatMessage->offer_quantity.' unit) telah diterima.',
            'created_at' => now(),
        ]);

        $negotiation->touch();

        // Invalidate buyer dashboard cache so next visit shows updated status
        Cache::forget("buyer_dashboard_{$negotiation->buyer_id}");

        return back();
    }

    /**
     * Reject a pending offer.
     */
    public function rejectOffer(Request $request, Negotiation $negotiation, ChatMessage $chatMessage): RedirectResponse
    {
        $userId = Auth::id();

        if ($negotiation->buyer_id !== $userId && $negotiation->seller_id !== $userId) {
            abort(403);
        }

        if ($chatMessage->negotiation_id !== $negotiation->id || $chatMessage->message_type !== 'offer' || $chatMessage->offer_status !== 'pending') {
            return back()->withErrors(['message' => 'Penawaran ini tidak valid untuk ditolak.']);
        }

        $chatMessage->update(['offer_status' => 'rejected']);

        $negotiation->messages()->create([
            'sender_id' => $userId,
            'message_type' => 'system',
            'message' => 'Penawaran telah ditolak.',
            'created_at' => now(),
        ]);

        $negotiation->touch();

        Cache::forget("navbar_counts_{$negotiation->buyer_id}");
        Cache::forget("navbar_counts_{$negotiation->seller_id}");

        return back();
    }

    /**
     * Counter a pending offer.
     */
    public function counterOffer(Request $request, Negotiation $negotiation, ChatMessage $chatMessage): RedirectResponse
    {
        $user = Auth::user();
        $userId = $user->id;

        if ($negotiation->buyer_id !== $userId && $negotiation->seller_id !== $userId) {
            abort(403);
        }

        $status = TransactionLifecycleService::getStatus($negotiation);
        $isSeller = $user->isSeller();
        $permissions = $isSeller
            ? TransactionLifecycleService::getSellerPermissions($status)
            : TransactionLifecycleService::getBuyerPermissions($status);

        if (! $permissions['can_offer']) {
            return back()->withErrors(['message' => 'Penawaran baru tidak dapat dibuat pada status transaksi saat ini.']);
        }

        $request->validate([
            'offer_price' => 'required|numeric|min:0',
            'offer_quantity' => 'required|integer|min:1',
        ]);

        // Mark previous offer as countered
        $chatMessage->update(['offer_status' => 'countered']);

        // Create new offer chat message
        ChatMessage::create([
            'negotiation_id' => $negotiation->id,
            'sender_id' => $userId,
            'message_type' => 'offer',
            'offer_price' => $request->offer_price,
            'offer_quantity' => $request->offer_quantity,
            'offer_status' => 'pending',
            'created_at' => now(),
        ]);

        $negotiation->touch();

        Cache::forget("navbar_counts_{$negotiation->buyer_id}");
        Cache::forget("navbar_counts_{$negotiation->seller_id}");

        return back();
    }
}
