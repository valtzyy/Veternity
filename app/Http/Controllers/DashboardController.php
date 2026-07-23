<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
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

        // For buyer, we can render normal dashboard or redirect to home/marketplace
        return Inertia::render('dashboard');
    }
}
