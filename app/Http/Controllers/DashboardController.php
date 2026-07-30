<?php

namespace App\Http\Controllers;

use App\Models\Negotiation;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Handle the user dashboard based on their role.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->isSeller()) {
            // Fetch stats for the seller dashboard
            $activeProducts = Product::where('seller_id', $user->id)
                ->where('status', 'available')
                ->count();

            $pendingProducts = Product::where('seller_id', $user->id)
                ->where('status', 'pending_review')
                ->count();

            // Mocking some other stats for design integration
            $stats = [
                'total_revenue' => 9400000, // Rp 9,4 Jt
                'revenue_growth' => '+18% bulan ini',
                'active_products' => $activeProducts,
                'pending_products' => $pendingProducts,
                'negotiation_count' => 4,
                'negotiation_unread' => 3,
                'completed_orders' => 23,
                'completed_orders_this_month' => 'bulan ini',
                'monthly_revenue_total' => 46600000, // Rp 46,6 Jt
            ];

            // Mocking recent orders list as shown in Figma
            $recentOrders = [
                [
                    'id' => 1,
                    'customer' => 'GreenGro Indonesia',
                    'detail' => 'Ampas Tahu Premium - 500 kg',
                    'status' => 'Selesai',
                    'status_color' => 'success',
                ],
                [
                    'id' => 2,
                    'customer' => 'EcoFarm Co.',
                    'detail' => 'Ampas Tahu Premium - 200 kg',
                    'status' => 'Pengiriman',
                    'status_color' => 'blue',
                ],
                [
                    'id' => 3,
                    'customer' => 'PT. Pupuk Hijau',
                    'detail' => 'Ampas Tahu Premium - 1 ton',
                    'status' => 'Negosiasi',
                    'status_color' => 'warning',
                ],
                [
                    'id' => 4,
                    'customer' => 'Biogas Nusantara',
                    'detail' => 'Ampas Tahu Premium - 750 kg',
                    'status' => 'Menunggu',
                    'status_color' => 'secondary',
                ],
            ];

            return Inertia::render('dashboard', [
                'stats' => $stats,
                'recentOrders' => $recentOrders,
            ]);
        }

        // For buyer: fetch active transactions from database
        $userId = $user->id;

        $transactions = Cache::remember("buyer_dashboard_{$userId}", 30, function () use ($userId) {
            $negotiations = Negotiation::with(['product.seller', 'product.images', 'buyer', 'seller', 'order.invoice'])
                ->where('buyer_id', $userId)
                ->latest('updated_at')
                ->get();

            return $negotiations->map(function ($item) {
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
        });

        return Inertia::render('dashboard', [
            'transactions' => $transactions,
        ]);
    }
}
