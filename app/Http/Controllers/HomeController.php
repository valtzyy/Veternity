<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
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
            'images',
        ])
            ->available()
            ->latest()
            ->take(8)
            ->get();

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

    /**
     * Display the public marketplace.
     */
    public function marketplace(Request $request): Response
    {
        $query = Product::with(['seller', 'category', 'images'])->available();

        // Search filter
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Verified seller filter
        if ($request->boolean('verified_only')) {
            $query->whereHas('seller', function ($q) {
                $q->where('is_verified', true);
            });
        }

        // Eco Score filter
        // We'll simulate Eco Score. If the table doesn't have an eco_score column,
        // we can filter using dummy logic or just keep the filter query and mock the field.
        // Let's mock a rating filter or keep it in request and handle it.

        $products = $query->latest()->paginate(12)->withQueryString();
        $categories = Category::all(['id', 'name']);

        return Inertia::render('marketplace', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'verified_only']),
        ]);
    }

    /**
     * Display a specific product detail page.
     */
    public function show(Product $product): Response
    {
        $product->load(['seller', 'category', 'images']);

        // Fetch related products (same category, excluding current product)
        $relatedProducts = Product::with(['seller', 'category', 'images'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->available()
            ->take(3)
            ->get();

        return Inertia::render('products/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
