<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the public landing page.
     */
    public function index()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

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

        $stats = Cache::remember('home_stats', 300, function () {
            return [
                'total_products' => Product::available()->count(),
                'total_categories' => Category::count(),
                'total_stock' => (int) Product::available()->sum('stock'),
                'total_sellers' => Product::available()->distinct('seller_id')->count('seller_id'),
            ];
        });

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
        $query = Product::with([
            'seller:id,name,is_verified',
            'category:id,name',
            'images',
        ])->available();

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
        if ($request->filled('eco_score')) {
            $ecoMin = (int) $request->eco_score;
            $driver = $query->getConnection()->getDriverName();
            if ($driver === 'pgsql') {
                $query->whereRaw('(ARRAY[94, 88, 97, 91, 85, 92, 89, 96])[MOD(id, 8) + 1] >= ?', [$ecoMin]);
            } else {
                $query->whereRaw('ELT(MOD(id, 8) + 1, 94, 88, 97, 91, 85, 92, 89, 96) >= ?', [$ecoMin]);
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'Terbaru');
        if ($sortBy === 'Harga terendah') {
            $query->orderBy('reference_price', 'asc');
        } elseif ($sortBy === 'Harga tertinggi') {
            $query->orderBy('reference_price', 'desc');
        } else {
            $query->latest();
        }

        $products = $query->paginate(12)->withQueryString();
        $categories = Cache::remember('categories_list', 600, fn () => Category::all(['id', 'name']));

        return Inertia::render('marketplace', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'verified_only', 'eco_score', 'sort_by']),
        ]);
    }

    /**
     * Display a specific product detail page.
     */
    public function show(Product $product): Response
    {
        $product->load([
            'seller:id,name,address,profile_photo,average_rating,total_reviews',
            'category:id,name',
            'images',
            'ratings' => function ($query) {
                $query->with('buyer:id,name,profile_photo')->latest();
            },
        ]);

        // Fetch related products (same category, excluding current product)
        $relatedProducts = Product::with(['seller:id,name', 'category:id,name', 'images'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->available()
            ->take(3)
            ->get();

        /** @var User|null $user */
        $user = Auth::user();

        return Inertia::render('products/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'isFavorited' => $user ? $user->favorites()->where('product_id', $product->id)->exists() : false,
        ]);
    }
}
