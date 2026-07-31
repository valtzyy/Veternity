<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\CloudinaryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the seller's products.
     */
    public function index(): Response
    {
        $products = Product::where('seller_id', Auth::id())
            ->with(['category:id,name', 'images'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('products/index', [
            'products' => $products,
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        $categories = Cache::remember('categories_list', 600, fn () => Category::all(['id', 'name']));

        return Inertia::render('products/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|min:5|max:255',
            'description' => 'required|string|min:20',
            'reference_price' => 'required|numeric|gt:0',
            'minimum_order' => 'required|integer|gte:1',
            'stock' => 'required|integer|gte:0',
            'unit' => 'required|in:kg,liter,pcs,box,ton',
            'category_id' => 'required|exists:categories,id',
            'condition' => 'nullable|string',
            'location' => 'required|string|max:255',
            'province' => 'nullable|string|max:255',
            'availability' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|max:5120', // max 5MB per image
        ]);

        // Map custom condition input to db enum
        $dbCondition = 'usable';
        $conditionLower = strtolower($validated['condition'] ?? '');
        if (str_contains($conditionLower, 'segar') || str_contains($conditionLower, 'fresh')) {
            $dbCondition = 'fresh';
        } elseif (str_contains($conditionLower, 'expired') || str_contains($conditionLower, 'kedaluwarsa') || str_contains($conditionLower, 'hampir')) {
            $dbCondition = 'near_expired';
        }

        // Create the product as pending review
        $product = Product::create([
            'seller_id' => Auth::id(),
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'reference_price' => $validated['reference_price'],
            'minimum_order' => $validated['minimum_order'],
            'stock' => $validated['stock'],
            'unit' => $validated['unit'],
            'location' => $validated['location'],
            'condition' => $dbCondition,
            'knowledge' => [
                'province' => $request->input('province'),
                'availability' => $request->input('availability', 'Harian'),
                'custom_condition' => $request->input('condition'),
                'notes' => $request->input('notes'),
            ],
            'status' => 'pending_review',
        ]);

        // Upload images to Cloudinary
        if ($request->hasFile('images')) {
            $isPrimary = true;
            foreach ($request->file('images') as $imageFile) {
                $imageUrl = CloudinaryService::upload($imageFile, 'products');

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imageUrl,
                    'is_primary' => $isPrimary,
                ]);

                $isPrimary = false;
            }
        }

        return redirect()->route('seller.products.index')
            ->with('message', 'Produk berhasil ditambahkan dan sedang menunggu moderasi.');
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        // Ensure seller owns the product
        if ($product->seller_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $categories = Cache::remember('categories_list', 600, fn () => Category::all(['id', 'name']));
        $product->load('images');

        return Inertia::render('products/edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        // Ensure seller owns the product
        if ($product->seller_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|min:5|max:255',
            'description' => 'required|string|min:20',
            'reference_price' => 'required|numeric|gt:0',
            'minimum_order' => 'required|integer|gte:1',
            'stock' => 'required|integer|gte:0',
            'unit' => 'required|in:kg,liter,pcs,box,ton',
            'category_id' => 'required|exists:categories,id',
            'condition' => 'nullable|string',
            'location' => 'required|string|max:255',
            'province' => 'nullable|string|max:255',
            'availability' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:5120',
        ]);

        // Map custom condition input to db enum
        $dbCondition = 'usable';
        $conditionLower = strtolower($validated['condition'] ?? '');
        if (str_contains($conditionLower, 'segar') || str_contains($conditionLower, 'fresh')) {
            $dbCondition = 'fresh';
        } elseif (str_contains($conditionLower, 'expired') || str_contains($conditionLower, 'kedaluwarsa') || str_contains($conditionLower, 'hampir')) {
            $dbCondition = 'near_expired';
        }

        $product->update([
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'reference_price' => $validated['reference_price'],
            'minimum_order' => $validated['minimum_order'],
            'stock' => $validated['stock'],
            'unit' => $validated['unit'],
            'location' => $validated['location'],
            'condition' => $dbCondition,
            'knowledge' => [
                'province' => $request->input('province'),
                'availability' => $request->input('availability', 'Harian'),
                'custom_condition' => $request->input('condition'),
                'notes' => $request->input('notes'),
            ],
        ]);

        // Upload new images if present
        if ($request->hasFile('images')) {
            // Delete old images first
            $product->images()->delete();

            $isPrimary = true;
            foreach ($request->file('images') as $imageFile) {
                $imageUrl = CloudinaryService::upload($imageFile, 'products');

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imageUrl,
                    'is_primary' => $isPrimary,
                ]);

                $isPrimary = false;
            }
        }

        return redirect()->route('seller.products.index')
            ->with('message', 'Produk berhasil diperbarui.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        // Ensure seller owns the product
        if ($product->seller_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $product->delete();

        return redirect()->route('seller.products.index')
            ->with('message', 'Produk berhasil diarsipkan.');
    }
}
