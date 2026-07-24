<?php

namespace App\Http\Controllers;

use App\Models\Negotiation;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NegotiationController extends Controller
{
    /**
     * Display a list of user negotiations & prototype creation card.
     */
    public function index(): Response
    {
        $userId = Auth::id();

        $negotiations = Negotiation::with(['product.seller', 'buyer', 'seller', 'messages' => function ($q) {
            $q->latest('created_at')->limit(1);
        }])
            ->where(function ($query) use ($userId) {
                $query->where('buyer_id', $userId)
                    ->orWhere('seller_id', $userId);
            })
            ->latest('updated_at')
            ->get();

        // Get a sample product for prototype testing if available
        $sampleProduct = Product::with('seller')->where('seller_id', '!=', $userId)->first()
            ?? Product::with('seller')->first();

        return Inertia::render('negotiations/index', [
            'negotiations' => $negotiations,
            'sampleProduct' => $sampleProduct,
        ]);
    }

    /**
     * Start a new negotiation session or redirect to existing active session.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);
        $buyerId = Auth::id();
        $sellerId = $product->seller_id;
        $user = Auth::user();

        if ($user->role !== 'buyer') {
            abort(403, 'Hanya buyer yang dapat memulai negosiasi.');
        }

        // Check if active negotiation already exists
        $existingNegotiation = Negotiation::where('product_id', $product->id)
            ->where('buyer_id', $buyerId)
            ->where('seller_id', $sellerId)
            ->whereIn('status', ['negotiating'])
            ->first();

        if ($existingNegotiation) {
            return redirect()->route('negotiations.show', $existingNegotiation->id);
        }

        // Create new negotiation
        $negotiation = Negotiation::create([
            'product_id' => $product->id,
            'buyer_id' => $buyerId,
            'seller_id' => $sellerId,
            'status' => 'negotiating',
            'agreed_price' => null,
            'agreed_quantity' => null,
        ]);

        // Optional initial system message
        $negotiation->messages()->create([
            'sender_id' => $buyerId,
            'message_type' => 'system',
            'message' => 'Sesi negosiasi telah dibuat.',
            'created_at' => now(),
        ]);

        return redirect()->route('negotiations.show', $negotiation->id);
    }

    /**
     * Display a specific negotiation chat session.
     */
    public function show(Negotiation $negotiation): Response
    {
        $userId = Auth::id();

        if ($negotiation->buyer_id !== $userId && $negotiation->seller_id !== $userId) {
            abort(403, 'Anda tidak memiliki akses ke negosiasi ini.');
        }

        $negotiation->load([
            'product.seller',
            'product.images',
            'buyer',
            'seller',
            'messages.sender',
        ]);

        // List active negotiations for the right sidebar
        $activeNegotiations = Negotiation::with(['product', 'buyer', 'seller', 'messages' => function ($q) {
            $q->latest('created_at')->limit(1);
        }])
            ->where(function ($query) use ($userId) {
                $query->where('buyer_id', $userId)
                    ->orWhere('seller_id', $userId);
            })
            ->latest('updated_at')
            ->get();

        return Inertia::render('negotiations/show', [
            'negotiation' => $negotiation,
            'product' => $negotiation->product,
            'buyer' => $negotiation->buyer,
            'seller' => $negotiation->seller,
            'chatMessages' => $negotiation->messages,
            'activeNegotiations' => $activeNegotiations,
        ]);
    }
}
