<?php

namespace App\Http\Controllers;

use App\Models\Negotiation;
use App\Models\Product;
use App\Services\TransactionLifecycleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NegotiationController extends Controller
{
    /**
     * Display a list of user transactions ("Pesanan Saya") full page.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $userId = $user->id;

        $negotiations = Negotiation::with(['product.seller', 'product.images', 'buyer', 'seller', 'order.invoice', 'order.rating'])
            ->where(function ($query) use ($userId) {
                $query->where('buyer_id', $userId)
                    ->orWhere('seller_id', $userId);
            })
            ->latest('updated_at')
            ->get();

        $transactions = $negotiations->map(function ($item) use ($user) {
            return TransactionLifecycleService::formatTransaction($item, $user);
        });

        return Inertia::render('negotiations/index', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Start a new negotiation session or redirect to existing active session.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'buy_now' => 'nullable|boolean',
        ]);

        $product = Product::findOrFail($request->product_id);
        $buyerId = Auth::id();
        $sellerId = $product->seller_id;
        $user = Auth::user();

        if ($user->role !== 'buyer') {
            abort(403, 'Hanya buyer yang dapat melakukan transaksi.');
        }

        if ($product->stock <= 0) {
            return back()->withErrors(['message' => 'Stok produk habis.']);
        }

        $isBuyNow = $request->boolean('buy_now');

        // Check if active (unfinished) negotiation already exists
        $existingNegotiation = Negotiation::where('product_id', $product->id)
            ->where('buyer_id', $buyerId)
            ->where('seller_id', $sellerId)
            ->whereIn('status', ['pending', 'negotiating', 'agreed'])
            ->whereDoesntHave('order', function ($query) {
                $query->whereIn('status', ['completed', 'cancelled']);
            })
            ->latest()
            ->first();

        if ($isBuyNow) {
            $agreedQuantity = min($product->stock, max(1, $product->minimum_order));
            $agreedPrice = $product->reference_price;

            if ($existingNegotiation) {
                $existingNegotiation->update([
                    'status' => 'agreed',
                    'agreed_price' => $agreedPrice,
                    'agreed_quantity' => $agreedQuantity,
                ]);
                $negotiation = $existingNegotiation;
            } else {
                $negotiation = Negotiation::create([
                    'product_id' => $product->id,
                    'buyer_id' => $buyerId,
                    'seller_id' => $sellerId,
                    'status' => 'agreed',
                    'agreed_price' => $agreedPrice,
                    'agreed_quantity' => $agreedQuantity,
                ]);
            }

            $negotiation->messages()->create([
                'sender_id' => $buyerId,
                'message_type' => 'system',
                'message' => 'Pembeli memilih Bayar Sekarang untuk produk '.$product->title.'.',
                'created_at' => now(),
            ]);

            return redirect()->route('negotiations.checkout', $negotiation->id);
        }

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
        $user = Auth::user();
        $userId = $user->id;

        if ($negotiation->buyer_id !== $userId && $negotiation->seller_id !== $userId) {
            abort(403, 'Anda tidak memiliki akses ke negosiasi ini.');
        }

        $negotiation->load([
            'product.seller:id,name',
            'product.images:id,product_id,image_url',
            'buyer:id,name,email',
            'seller:id,name,email',
            'messages.sender:id,name',
            'order.invoice:id,order_id,invoice_number',
            'order.rating',
        ]);

        $status = TransactionLifecycleService::getStatus($negotiation);
        $step = TransactionLifecycleService::getStep($status);
        $isSeller = $user->isSeller();
        $permissions = $isSeller
            ? TransactionLifecycleService::getSellerPermissions($status)
            : TransactionLifecycleService::getBuyerPermissions($status);

        // Load sidebar negotiations with minimal columns
        $activeNegotiations = Negotiation::with([
            'product:id,title',
            'messages' => function ($q) {
                $q->select('id', 'negotiation_id', 'message', 'message_type', 'created_at')
                    ->latest('created_at')
                    ->limit(1);
            },
        ])
            ->select('id', 'product_id', 'buyer_id', 'seller_id', 'status', 'updated_at')
            ->where(function ($query) use ($userId) {
                $query->where('buyer_id', $userId)
                    ->orWhere('seller_id', $userId);
            })
            ->latest('updated_at')
            ->limit(20)
            ->get();

        $hasReviewed = $negotiation->order ? (bool) $negotiation->order->rating : false;

        return Inertia::render('negotiations/show', [
            'negotiation' => $negotiation,
            'product' => $negotiation->product,
            'buyer' => $negotiation->buyer,
            'seller' => $negotiation->seller,
            'chatMessages' => $negotiation->messages,
            'activeNegotiations' => $activeNegotiations,
            'lifecycle' => [
                'status' => $status,
                'step' => $step,
                'can_chat' => $permissions['can_chat'],
                'can_offer' => $permissions['can_offer'],
                'has_reviewed' => $hasReviewed,
            ],
        ]);
    }

    /**
     * Display the buyer's order history page.
     */
    public function buyerOrders(Request $request): Response
    {
        return $this->index();
    }
}
