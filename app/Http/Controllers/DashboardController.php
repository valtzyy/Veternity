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

            $sellerNegotiations = Negotiation::with(['product', 'buyer', 'order.invoice'])
                ->where('seller_id', $user->id)
                ->latest('updated_at')
                ->limit(5)
                ->get();

            $recentOrders = $sellerNegotiations->map(function ($item) use ($user) {
                $formatted = TransactionLifecycleService::formatTransaction($item, $user);

                return [
                    'id' => $item->id,
                    'customer' => $item->buyer->name ?? 'Customer',
                    'detail' => ($item->product->title ?? 'Produk Limbah').' - '.$formatted['qty'],
                    'status' => $formatted['status'],
                    'status_color' => match ($formatted['status']) {
                        'Selesai' => 'success',
                        'Pickup' => 'blue',
                        'Pembayaran', 'Negosiasi' => 'warning',
                        default => 'secondary',
                    },
                    'action_url' => $formatted['action_url'],
                ];
            });

            $stats = [
                'total_revenue' => 9400000,
                'revenue_growth' => '+18% bulan ini',
                'active_products' => $activeProducts,
                'pending_products' => $pendingProducts,
                'negotiation_count' => count($sellerNegotiations) ?: 4,
                'negotiation_unread' => 3,
                'completed_orders' => 23,
                'completed_orders_this_month' => 'bulan ini',
                'monthly_revenue_total' => 46600000,
            ];

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
            $date = now()->subMonths($i);
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
