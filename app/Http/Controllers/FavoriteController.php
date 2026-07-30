<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    /**
     * Display the buyer's favorite products list.
     */
    public function index(): Response
    {
        $products = Auth::user()->favorites()
            ->with(['seller', 'category', 'images'])
            ->latest('favorites.created_at')
            ->get();

        return Inertia::render('favorites/index', [
            'products' => $products,
        ]);
    }

    /**
     * Toggle a product in/out of the user's favorites.
     */
    public function toggle(Product $product): RedirectResponse
    {
        $user = Auth::user();

        if ($user->favorites()->where('product_id', $product->id)->exists()) {
            $user->favorites()->detach($product->id);
            $message = 'Produk dihapus dari favorit.';
        } else {
            $user->favorites()->attach($product->id);
            $message = 'Produk ditambahkan ke favorit.';
        }

        return back()->with('message', $message);
    }
}
