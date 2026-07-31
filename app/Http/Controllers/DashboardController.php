<?php

namespace App\Http\Controllers;

use App\Models\Negotiation;
use App\Models\Order;
use App\Models\Product;
use App\Services\TransactionLifecycleService;
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

            // 1. Total Revenue (Completed & processing orders)
            $totalRevenue = Order::where('seller_id', $user->id)
                ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
                ->selectRaw('SUM(final_price * final_quantity) as total')
                ->value('total') ?? 0;

            // 2. Revenue growth comparison (This month vs Last month)
            $revenueThisMonth = Order::where('seller_id', $user->id)
                ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->selectRaw('SUM(final_price * final_quantity) as total')
                ->value('total') ?? 0;

            $revenueLastMonth = Order::where('seller_id', $user->id)
                ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->selectRaw('SUM(final_price * final_quantity) as total')
                ->value('total') ?? 0;

            $growth = $revenueLastMonth > 0 ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100) : 100;
            $revenueGrowthText = ($growth >= 0 ? '+' : '').$growth.'% bulan ini';

            // 3. Active negotiations
            $negotiationCount = Negotiation::where('seller_id', $user->id)
                ->whereIn('status', ['pending', 'negotiating'])
                ->count();

            // Count negotiations that have unread/incoming messages from buyers
            $negotiationUnread = 0;
            $sellerNegos = Negotiation::with(['messages' => function ($q) {
                $q->latest('created_at')->limit(1);
            }])
                ->where('seller_id', $user->id)
                ->whereIn('status', ['pending', 'negotiating'])
                ->get();
            foreach ($sellerNegos as $nego) {
                $lastMessage = $nego->messages->first();
                if ($lastMessage && $lastMessage->sender_id !== $user->id) {
                    $negotiationUnread++;
                }
            }

            // 4. Completed orders
            $completedOrders = Order::where('seller_id', $user->id)
                ->where('status', 'completed')
                ->count();
            $completedOrdersThisMonth = Order::where('seller_id', $user->id)
                ->where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
            $completedOrdersThisMonthText = $completedOrdersThisMonth.' selesai bulan ini';

            // 5. Monthly Revenue Chart (Last 7 months)
            $monthlyRevenue = [];
            $monthlyRevenueTotal = 0;
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->startOfMonth()->subMonths($i);
                $monthName = $date->translatedFormat('M');
                $monthNum = $date->month;
                $yearNum = $date->year;

                $sum = Order::where('seller_id', $user->id)
                    ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
                    ->whereMonth('created_at', $monthNum)
                    ->whereYear('created_at', $yearNum)
                    ->selectRaw('SUM(final_price * final_quantity) as total')
                    ->value('total') ?? 0;

                $monthlyRevenue[] = [
                    'month' => $monthName,
                    'amount' => (int) $sum,
                ];
                $monthlyRevenueTotal += $sum;
            }

            $stats = [
                'total_revenue' => (int) $totalRevenue,
                'revenue_growth' => $revenueGrowthText,
                'active_products' => $activeProducts,
                'pending_products' => $pendingProducts,
                'negotiation_count' => $negotiationCount,
                'negotiation_unread' => $negotiationUnread,
                'completed_orders' => $completedOrders,
                'completed_orders_this_month' => $completedOrdersThisMonthText,
                'monthly_revenue_total' => (int) $monthlyRevenueTotal,
                'monthly_revenue' => $monthlyRevenue,
            ];

            // 6. Recent Orders List
            $recentOrders = Order::with(['buyer', 'negotiation.product'])
                ->where('seller_id', $user->id)
                ->latest()
                ->take(4)
                ->get()
                ->map(function ($order) {
                    $statusColor = 'secondary';
                    $statusName = 'Menunggu';

                    if ($order->status === 'waiting_payment') {
                        $statusColor = 'warning';
                        $statusName = 'Pembayaran';
                    } elseif ($order->status === 'paid') {
                        $statusColor = 'blue';
                        $statusName = 'Pickup';
                    } elseif ($order->status === 'processing' || $order->status === 'shipping') {
                        $statusColor = 'blue';
                        $statusName = 'Diproses';
                    } elseif ($order->status === 'completed') {
                        $statusColor = 'success';
                        $statusName = 'Selesai';
                    } elseif ($order->status === 'cancelled') {
                        $statusColor = 'secondary';
                        $statusName = 'Batal';
                    }

                    return [
                        'id' => $order->id,
                        'negotiation_id' => $order->negotiation_id,
                        'customer' => $order->buyer->name ?? 'Pembeli',
                        'detail' => ($order->negotiation->product->title ?? 'Produk').' - '.$order->final_quantity.' '.($order->negotiation->product->unit ?? 'kg'),
                        'status' => $statusName,
                        'status_color' => $statusColor,
                    ];
                });

            return Inertia::render('dashboard', [
                'stats' => $stats,
                'recentOrders' => $recentOrders,
            ]);
        }

        // For buyer: fetch active transactions from database
        $userId = $user->id;

        // 1. Total Spend (Completed or processing orders)
        $totalSpend = Order::where('buyer_id', $userId)
            ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
            ->selectRaw('SUM(final_price * final_quantity) as total')
            ->value('total') ?? 0;

        // 2. Active Orders
        $activeOrdersCount = Order::where('buyer_id', $userId)
            ->whereIn('status', ['waiting_payment', 'paid', 'processing', 'shipping'])
            ->count();
        $actionRequiredOrdersCount = Order::where('buyer_id', $userId)
            ->where('status', 'waiting_payment')
            ->count();

        // 3. Active Negotiations
        $activeNegosCount = Negotiation::where('buyer_id', $userId)
            ->whereIn('status', ['pending', 'negotiating'])
            ->count();
        $counterOfferCount = Negotiation::where('buyer_id', $userId)
            ->where('status', 'negotiating')
            ->count();

        // 4. CO2 Reduced (1 kg food waste saved = ~2.5 kg CO2 = 0.0025 tons CO2)
        $totalWeightKg = Order::where('buyer_id', $userId)
            ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
            ->sum('final_quantity');
        $co2ReducedTons = round($totalWeightKg * 0.0025, 2);

        // 5. Expense History (Last 6 months)
        $monthlyExpenses = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->startOfMonth()->subMonths($i);
            $monthName = $date->translatedFormat('M');
            $monthNum = $date->month;
            $yearNum = $date->year;

            $sum = Order::where('buyer_id', $userId)
                ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
                ->whereMonth('created_at', $monthNum)
                ->whereYear('created_at', $yearNum)
                ->selectRaw('SUM(final_price * final_quantity) as total')
                ->value('total') ?? 0;

            $monthlyExpenses[] = [
                'month' => $monthName,
                'amount' => (int) $sum,
            ];
        }

        // 6. Favorite Products (Top 3)
        $favoriteProducts = $user->favorites()
            ->with(['seller', 'images'])
            ->latest('favorites.created_at')
            ->take(3)
            ->get();

        $buyerStats = [
            'total_spend' => (int) $totalSpend,
            'active_orders' => $activeOrdersCount,
            'action_required_orders' => $actionRequiredOrdersCount,
            'active_negotiations' => $activeNegosCount,
            'counter_offers' => $counterOfferCount,
            'co2_reduced' => $co2ReducedTons,
            'monthly_expenses' => $monthlyExpenses,
            'favorites' => $favoriteProducts,
        ];

        $transactions = Cache::remember("buyer_dashboard_{$userId}", 30, function () use ($user, $userId) {
            $negotiations = Negotiation::with(['product.seller', 'product.images', 'buyer', 'seller', 'order.invoice'])
                ->where('buyer_id', $userId)
                ->latest('updated_at')
                ->get();

            return $negotiations->map(function ($item) use ($user) {
                return TransactionLifecycleService::formatTransaction($item, $user);
            });
        });

        return Inertia::render('dashboard', [
            'transactions' => $transactions,
            'buyerStats' => $buyerStats,
        ]);
    }
}
