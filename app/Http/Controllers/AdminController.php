<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function dashboard(): Response
    {
        $stats = [
            'total_users' => User::count(),
            'total_sellers' => User::where('role', 'seller')->count(),
            'total_buyers' => User::where('role', 'buyer')->count(),
            'total_products' => Product::count(),
            'pending_approvals' => Product::where('status', 'pending_review')->count(),
            'total_waste_prevented' => Product::where('status', 'available')->sum('stock'), // Placeholder for social impact
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
        ]);
    }

    /**
     * Display user management list.
     */
    public function users(): Response
    {
        $users = User::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('admin/users', [
            'users' => $users,
        ]);
    }

    /**
     * Display product approval queue.
     */
    public function products(): Response
    {
        $products = Product::with(['seller', 'category'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/products', [
            'products' => $products,
        ]);
    }

    /**
     * Approve the specified product.
     */
    public function approve(Product $product)
    {
        $product->update(['status' => 'available']);

        return back()->with('message', "Produk '{$product->title}' berhasil disetujui.");
    }

    /**
     * Reject the specified product.
     */
    public function reject(Product $product)
    {
        $product->update(['status' => 'inactive']);

        return back()->with('message', "Produk '{$product->title}' telah ditolak.");
    }
}
