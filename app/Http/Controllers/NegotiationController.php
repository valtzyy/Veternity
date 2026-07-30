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
     * Display a list of user transactions ("Pesanan Saya") full page.
     */
    public function index(): Response
    {
        $userId = Auth::id();

        $negotiations = Negotiation::with(['product.seller', 'product.images', 'buyer', 'seller', 'order.invoice'])
            ->where(function ($query) use ($userId) {
                $query->where('buyer_id', $userId)
                    ->orWhere('seller_id', $userId);
            })
            ->latest('updated_at')
            ->get();

        $transactions = $negotiations->map(function ($item) {
            $product = $item->product;
            $order = $item->order;

            $priceVal = $item->agreed_price ?? ($product->reference_price ?? 0);
            $qtyVal = $item->agreed_quantity ?? ($product->minimum_order ?? 1);
            $unitStr = $product->unit ?? 'kg';

            $priceFormatted = 'Rp '.number_format($priceVal * $qtyVal, 0, ',', '.');
            $dateFormatted = $item->updated_at ? $item->updated_at->format('d M Y') : now()->format('d M Y');

            $status = 'Menunggu';
            $step = 0;
            $button = null;
            $actionUrl = route('negotiations.show', $item->id);
            $code = 'REG-NEGO-'.str_pad($item->id, 4, '0', STR_PAD_LEFT);

            if ($order) {
                $code = $order->order_number ?? $code;
                if ($order->status === 'waiting_payment') {
                    $status = 'Pembayaran';
                    $step = 2;
                    $button = 'Bayar Sekarang';
                    $actionUrl = route('orders.payment', $order->id);
                } elseif ($order->status === 'paid') {
                    $status = 'Pickup';
                    $step = 3;
                    $button = $order->invoice ? 'Lihat Invoice' : 'Detail';
                    $actionUrl = $order->invoice ? route('invoices.show', $order->invoice->id) : route('negotiations.show', $item->id);
                } elseif ($order->status === 'completed') {
                    $status = 'Selesai';
                    $step = 4;
                    $button = 'Beri Ulasan';
                    $actionUrl = route('negotiations.show', $item->id);
                } elseif ($order->status === 'cancelled') {
                    $status = 'Batal';
                    $step = 0;
                    $button = null;
                    $actionUrl = route('negotiations.show', $item->id);
                }
            } else {
                if ($item->status === 'agreed') {
                    $status = 'Pembayaran';
                    $step = 2;
                    $button = 'Bayar Sekarang';
                    $actionUrl = route('negotiations.checkout', $item->id);
                } elseif ($item->status === 'negotiating') {
                    $status = 'Negosiasi';
                    $step = 1;
                    $button = 'Lihat Chat';
                    $actionUrl = route('negotiations.show', $item->id);
                } elseif ($item->status === 'pending') {
                    $status = 'Menunggu';
                    $step = 0;
                    $button = 'Lihat Chat';
                    $actionUrl = route('negotiations.show', $item->id);
                }
            }

            return [
                'id' => $item->id,
                'negotiation_id' => $item->id,
                'order_id' => $order ? $order->id : null,
                'code' => $code,
                'name' => $product->title ?? 'Produk Limbah Pangan',
                'seller' => $item->seller->name ?? 'Supplier',
                'qty' => $qtyVal.' '.$unitStr,
                'price' => $priceFormatted,
                'date' => $dateFormatted,
                'status' => $status,
                'step' => $step,
                'button' => $button,
                'action_url' => $actionUrl,
                'complete_url' => ($order && $order->status === 'paid') ? route('orders.complete', $order->id) : null,
                'nego' => true,
            ];
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
            'product.seller:id,name',
            'product.images:id,product_id,image_url',
            'buyer:id,name,email',
            'seller:id,name,email',
            'messages.sender:id,name',
            'order.invoice:id,order_id,invoice_number',
        ]);

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

        return Inertia::render('negotiations/show', [
            'negotiation' => $negotiation,
            'product' => $negotiation->product,
            'buyer' => $negotiation->buyer,
            'seller' => $negotiation->seller,
            'chatMessages' => $negotiation->messages,
            'activeNegotiations' => $activeNegotiations,
        ]);
    }

    /**
     * Display the buyer's order history page.
     */
    public function buyerOrders(Request $request): Response
    {
        $userId = Auth::id();

        $negotiations = Negotiation::with([
            'product:id,title,reference_price,stock,unit,seller_id',
            'product.seller:id,name',
            'product.images:id,product_id,image_url',
            'seller:id,name',
            'order:id,negotiation_id,order_number,final_price,final_quantity,status,created_at',
            'order.invoice:id,order_id,invoice_number',
        ])
            ->select('id', 'product_id', 'buyer_id', 'seller_id', 'status', 'agreed_price', 'agreed_quantity', 'updated_at')
            ->where('buyer_id', $userId)
            ->latest('updated_at')
            ->get();

        return Inertia::render('negotiations/orders', [
            'negotiations' => $negotiations,
        ]);
    }
}
