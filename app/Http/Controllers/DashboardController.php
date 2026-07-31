<?php

namespace App\Http\Controllers;

use App\Models\Negotiation;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\TransactionLifecycleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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
            return $this->sellerDashboard($user);
        }

        return $this->buyerDashboard($user);
    }

    /**
     * Render seller dashboard with cached stats.
     *
     * @param  User  $user
     */
    private function sellerDashboard($user)
    {
        $userId = $user->id;

        // Cache the heavy stats for 2 minutes (120s)
        $stats = Cache::remember("seller_stats_{$userId}", 120, function () use ($userId) {
            $activeProducts = Product::where('seller_id', $userId)
                ->where('status', 'available')
                ->count();

            $pendingProducts = Product::where('seller_id', $userId)
                ->where('status', 'pending_review')
                ->count();

            // Revenue stats in a single query using conditional aggregation
            $revenueStats = Order::where('seller_id', $userId)
                ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
                ->selectRaw('
                    SUM(final_price * final_quantity) as total_revenue,
                    SUM(CASE WHEN EXTRACT(MONTH FROM created_at) = ? AND EXTRACT(YEAR FROM created_at) = ? THEN final_price * final_quantity ELSE 0 END) as this_month,
                    SUM(CASE WHEN EXTRACT(MONTH FROM created_at) = ? AND EXTRACT(YEAR FROM created_at) = ? THEN final_price * final_quantity ELSE 0 END) as last_month
                ', [
                    now()->month,
                    now()->year,
                    now()->subMonth()->month,
                    now()->subMonth()->year,
                ])
                ->first();

            $totalRevenue = $revenueStats->total_revenue ?? 0;
            $revenueThisMonth = $revenueStats->this_month ?? 0;
            $revenueLastMonth = $revenueStats->last_month ?? 0;

            $growth = $revenueLastMonth > 0
                ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100)
                : 100;
            $revenueGrowthText = ($growth >= 0 ? '+' : '').$growth.'% bulan ini';

            // Completed orders in a single query using conditional aggregation
            $orderStats = Order::where('seller_id', $userId)
                ->where('status', 'completed')
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN EXTRACT(MONTH FROM created_at) = ? AND EXTRACT(YEAR FROM created_at) = ? THEN 1 ELSE 0 END) as this_month
                ', [now()->month, now()->year])
                ->first();

            $completedOrders = $orderStats->total ?? 0;
            $completedOrdersThisMonth = $orderStats->this_month ?? 0;
            $completedOrdersThisMonthText = $completedOrdersThisMonth.' selesai bulan ini';

            // Active negotiations — single query, derive both count and unread count in PHP
            $activeNegos = Negotiation::with(['messages' => function ($q) {
                $q->latest('created_at')->limit(1);
            }])
                ->where('seller_id', $userId)
                ->whereIn('status', ['pending', 'negotiating'])
                ->get(['id', 'seller_id', 'status']);

            $negotiationCount = $activeNegos->count();
            $negotiationUnread = $activeNegos->filter(function ($nego) use ($userId) {
                $lastMessage = $nego->messages->first();

                return $lastMessage && $lastMessage->sender_id !== $userId;
            })->count();

            // Monthly Revenue Chart — single GROUP BY query (last 7 months)
            $monthExpr = $this->monthGroupExpression();
            $monthlyRevenueRaw = Order::where('seller_id', $userId)
                ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
                ->where('created_at', '>=', now()->startOfMonth()->subMonths(6))
                ->selectRaw("{$monthExpr} as month, SUM(final_price * final_quantity) as total")
                ->groupByRaw($monthExpr)
                ->orderByRaw($monthExpr)
                ->pluck('total', 'month')
                ->mapWithKeys(fn ($v, $k) => [substr($k, 0, 7) => (int) $v]);

            $monthlyRevenue = [];
            $monthlyRevenueTotal = 0;
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->startOfMonth()->subMonths($i);
                $key = $date->format('Y-m');
                $amount = $monthlyRevenueRaw->get($key, 0);
                $monthlyRevenue[] = [
                    'month' => $date->translatedFormat('M'),
                    'amount' => $amount,
                ];
                $monthlyRevenueTotal += $amount;
            }

            return [
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
        });

        // Recent orders are not cached (must always be up-to-date)
        $recentOrders = Order::with(['buyer:id,name', 'negotiation.product:id,title,unit'])
            ->where('seller_id', $userId)
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

    /**
     * Render buyer dashboard with cached stats.
     *
     * @param  User  $user
     */
    private function buyerDashboard($user)
    {
        $userId = $user->id;

        // Cache buyer stats for 90 seconds
        $buyerStats = Cache::remember("buyer_stats_{$userId}", 90, function () use ($userId, $user) {
            // Revenue, order counts, CO2 — all in a single query using conditional aggregation
            $orderStats = Order::where('buyer_id', $userId)
                ->selectRaw('
                    SUM(CASE WHEN status IN (\'paid\', \'processing\', \'shipping\', \'completed\') THEN final_price * final_quantity ELSE 0 END) as total_spend,
                    SUM(CASE WHEN status IN (\'paid\', \'processing\', \'shipping\', \'completed\') THEN final_quantity ELSE 0 END) as total_weight,
                    SUM(CASE WHEN status IN (\'waiting_payment\', \'paid\', \'processing\', \'shipping\') THEN 1 ELSE 0 END) as active_orders,
                    SUM(CASE WHEN status = \'waiting_payment\' THEN 1 ELSE 0 END) as action_required
                ')
                ->first();

            $totalSpend = $orderStats->total_spend ?? 0;
            $totalWeightKg = $orderStats->total_weight ?? 0;
            $activeOrdersCount = $orderStats->active_orders ?? 0;
            $actionRequiredOrdersCount = $orderStats->action_required ?? 0;
            $co2ReducedTons = round($totalWeightKg * 0.0025, 2);

            // Negotiations stats
            $activeNegosCount = Negotiation::where('buyer_id', $userId)
                ->whereIn('status', ['pending', 'negotiating'])
                ->count();

            $counterOfferCount = Negotiation::where('buyer_id', $userId)
                ->where('status', 'negotiating')
                ->count();

            // Monthly expenses — single GROUP BY query (last 6 months)
            $monthExpr = $this->monthGroupExpression();
            $monthlyExpensesRaw = Order::where('buyer_id', $userId)
                ->whereIn('status', ['paid', 'processing', 'shipping', 'completed'])
                ->where('created_at', '>=', now()->startOfMonth()->subMonths(5))
                ->selectRaw("{$monthExpr} as month, SUM(final_price * final_quantity) as total")
                ->groupByRaw($monthExpr)
                ->orderByRaw($monthExpr)
                ->pluck('total', 'month')
                ->mapWithKeys(fn ($v, $k) => [substr($k, 0, 7) => (int) $v]);

            $monthlyExpenses = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->startOfMonth()->subMonths($i);
                $key = $date->format('Y-m');
                $monthlyExpenses[] = [
                    'month' => $date->translatedFormat('M'),
                    'amount' => $monthlyExpensesRaw->get($key, 0),
                ];
            }

            // Favorite products
            $favorites = $user->favorites()
                ->with(['seller:id,name', 'images'])
                ->latest('favorites.created_at')
                ->take(3)
                ->get();

            return [
                'total_spend' => (int) $totalSpend,
                'active_orders' => (int) $activeOrdersCount,
                'action_required_orders' => (int) $actionRequiredOrdersCount,
                'active_negotiations' => $activeNegosCount,
                'counter_offers' => $counterOfferCount,
                'co2_reduced' => $co2ReducedTons,
                'monthly_expenses' => $monthlyExpenses,
                'favorites' => $favorites,
            ];
        });

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

    /**
     * Return a SQL expression that truncates a timestamp to year-month.
     * Supports both PostgreSQL (production) and SQLite (testing).
     */
    private function monthGroupExpression(): string
    {
        $driver = DB::connection()->getDriverName();

        return $driver === 'pgsql'
            ? "DATE_TRUNC('month', created_at)"
            : "STRFTIME('%Y-%m', created_at)";
    }
}
