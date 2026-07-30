<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Negotiation;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Show the checkout page for an agreed negotiation.
     */
    public function showCheckout(Negotiation $negotiation): Response|RedirectResponse
    {
        $userId = Auth::id();

        // Check accessibility
        if ($negotiation->buyer_id !== $userId) {
            abort(403, 'Akses ditolak.');
        }

        if ($negotiation->status !== 'agreed') {
            return redirect()->route('negotiations.show', $negotiation->id)
                ->withErrors(['message' => 'Negosiasi belum disetujui.']);
        }

        // Check if order already exists
        $existingOrder = Order::where('negotiation_id', $negotiation->id)->first();
        if ($existingOrder) {
            if ($existingOrder->status === 'waiting_payment') {
                return redirect()->route('orders.payment', $existingOrder->id);
            }

            return redirect()->route('negotiations.show', $negotiation->id)
                ->with('message', 'Pesanan untuk negosiasi ini sudah dibayar/diproses.');
        }

        $negotiation->load(['product.images', 'seller']);

        return Inertia::render('negotiations/checkout', [
            'negotiation' => $negotiation,
            'product' => $negotiation->product,
            'seller' => $negotiation->seller,
        ]);
    }

    /**
     * Process checkout form and create the Order.
     */
    public function processCheckout(Request $request, Negotiation $negotiation): RedirectResponse
    {
        $userId = Auth::id();

        if ($negotiation->buyer_id !== $userId) {
            abort(403);
        }

        if ($negotiation->status !== 'agreed') {
            return back()->withErrors(['message' => 'Status negosiasi tidak valid.']);
        }

        // Prevent double order
        $existingOrder = Order::where('negotiation_id', $negotiation->id)->first();
        if ($existingOrder) {
            return redirect()->route('orders.payment', $existingOrder->id);
        }

        $validated = $request->validate([
            'receiver_name' => 'required|string|max:255',
            'receiver_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $orderNumber = 'REG-'.date('Ymd').'-'.rand(1000, 9999);

        $order = Order::create([
            'negotiation_id' => $negotiation->id,
            'seller_id' => $negotiation->seller_id,
            'buyer_id' => $negotiation->buyer_id,
            'order_number' => $orderNumber,
            'final_price' => $negotiation->agreed_price,
            'final_quantity' => $negotiation->agreed_quantity,
            'receiver_name' => $validated['receiver_name'],
            'receiver_phone' => $validated['receiver_phone'],
            'shipping_address' => $validated['shipping_address'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'waiting_payment',
        ]);

        return redirect()->route('orders.payment', $order->id);
    }

    /**
     * Show the payment gateway simulation page.
     */
    public function showPayment(Order $order): Response|RedirectResponse
    {
        $userId = Auth::id();

        if ($order->buyer_id !== $userId && $order->seller_id !== $userId) {
            abort(403);
        }

        if ($order->status !== 'waiting_payment') {
            return redirect()->route('negotiations.show', $order->negotiation_id)
                ->with('message', 'Pesanan ini sudah terbayar atau dalam proses.');
        }

        $order->load(['negotiation.product.images', 'seller']);

        return Inertia::render('negotiations/payment', [
            'order' => $order,
            'negotiation' => $order->negotiation,
            'product' => $order->negotiation->product,
            'seller' => $order->seller,
        ]);
    }

    /**
     * Simulate payment success.
     */
    public function processPayment(Request $request, Order $order): RedirectResponse
    {
        $userId = Auth::id();

        if ($order->buyer_id !== $userId) {
            abort(403);
        }

        if ($order->status !== 'waiting_payment') {
            return back()->withErrors(['message' => 'Pesanan sudah dibayar.']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|string|in:bank_transfer,e_wallet,reguna_escrow',
        ]);

        // Update order status
        $order->update([
            'status' => 'paid',
            'payment_method' => $validated['payment_method'],
        ]);

        // Create transaction payment
        Payment::create([
            'order_id' => $order->id,
            'transaction_id' => 'TX-'.date('YmdHis').'-'.rand(1000, 9999),
            'payment_method' => $validated['payment_method'],
            'gross_amount' => $order->final_price * $order->final_quantity,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        // Create invoice
        Invoice::create([
            'order_id' => $order->id,
            'invoice_number' => 'INV-'.date('Ymd').'-'.rand(1000, 9999),
            'order_number' => $order->order_number,
            'gross_amount' => $order->final_price * $order->final_quantity,
            'final_amount' => $order->final_price * $order->final_quantity + 15000 + 2500, // include shipping & service fee
            'payment_method' => $validated['payment_method'],
            'generated_at' => now(),
            'paid_at' => now(),
        ]);

        // Notify in negotiation chat
        $methodLabel = [
            'bank_transfer' => 'Transfer Bank',
            'e_wallet' => 'E-Wallet',
            'reguna_escrow' => 'Rekening Bersama ReGuna',
        ][$validated['payment_method']] ?? 'Online';

        $order->negotiation->messages()->create([
            'sender_id' => $userId,
            'message_type' => 'system',
            'message' => 'Pembayaran sebesar Rp '.number_format($order->final_price * $order->final_quantity, 0, ',', '.')." menggunakan {$methodLabel} berhasil diterima. Pesanan sedang diproses.",
            'created_at' => now(),
        ]);

        return redirect()->route('negotiations.show', $order->negotiation_id)
            ->with('message', 'Pembayaran berhasil disimulasikan!');
    }

    /**
     * Show the invoice / payment proof page.
     */
    public function showInvoice(Invoice $invoice): Response
    {
        $userId = Auth::id();
        $invoice->load(['order.negotiation.product.images', 'order.buyer', 'order.seller']);

        if ($invoice->order->buyer_id !== $userId && $invoice->order->seller_id !== $userId) {
            abort(403, 'Akses ditolak.');
        }

        return Inertia::render('negotiations/invoice', [
            'invoice' => $invoice,
            'order' => $invoice->order,
            'product' => $invoice->order->negotiation->product,
            'buyer' => $invoice->order->buyer,
            'seller' => $invoice->order->seller,
        ]);
    }

    /**
     * Mark a paid (Pickup) order as completed by the buyer.
     */
    public function completeOrder(Order $order): RedirectResponse
    {
        $userId = Auth::id();

        if ($order->buyer_id !== $userId) {
            abort(403, 'Hanya buyer yang dapat menyelesaikan pesanan.');
        }

        if ($order->status !== 'paid') {
            return back()->withErrors(['message' => 'Pesanan tidak dalam status Pickup. Tidak dapat diselesaikan.']);
        }

        $order->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        $order->negotiation->messages()->create([
            'sender_id' => $userId,
            'message_type' => 'system',
            'message' => 'Pesanan telah dikonfirmasi selesai oleh buyer. Terima kasih telah menggunakan ReGuna!',
            'created_at' => now(),
        ]);

        return redirect()->route('buyer.orders')
            ->with('message', 'Pesanan berhasil diselesaikan!');
    }
}
