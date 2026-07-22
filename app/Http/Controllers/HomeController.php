<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the public landing page.
     */
    public function index(): Response
    {
        $categories = Category::withCount('products')
            ->withSum('products', 'stock')
            ->orderBy('products_count', 'desc')
            ->get(['id', 'name', 'description', 'icon']);

        $latestProducts = Product::with([
            'seller:id,name,address',
            'category:id,name',
        ])
            ->available()
            ->latest()
            ->take(8)
            ->get([
                'id', 'title', 'reference_price',
                'stock', 'unit', 'location',
                'condition', 'seller_id', 'category_id',
                'created_at',
            ]);

        $stats = [
            'total_products' => Product::available()->count(),
            'total_categories' => Category::count(),
            'total_stock' => (int) Product::available()->sum('stock'),
            'total_sellers' => Product::available()->distinct('seller_id')->count('seller_id'),
        ];

        return Inertia::render('home', [
            'categories' => $categories,
            'latestProducts' => $latestProducts,
            'stats' => $stats,
        ]);
    }
}
