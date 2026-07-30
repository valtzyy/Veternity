<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Rating;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RatingController extends Controller
{
    /**
     * Store a new product/seller review and rating.
     */
    public function store(Request $request, Order $order): RedirectResponse
    {
        // Ensure the logged-in user is the buyer of this order
        if ($order->buyer_id !== Auth::id()) {
            abort(403, 'Anda tidak diizinkan memberi ulasan untuk pesanan ini.');
        }

        // Validate the request
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
            'tags' => 'nullable|array',
        ]);

        // Construct final review content with selected chips/tags if any
        $reviewContent = $request->input('review', '');
        if ($request->filled('tags')) {
            $tagsString = implode(', ', $request->input('tags'));
            $reviewContent = ($reviewContent ? $reviewContent."\n\n" : '').'[Kelebihan: '.$tagsString.']';
        }

        // Ensure order is completed before rating
        if ($order->status !== 'completed') {
            abort(400, 'Anda hanya dapat mengulas pesanan yang sudah selesai.');
        }

        // Check if rating already exists for this order
        $existingRating = Rating::where('order_id', $order->id)->first();
        if ($existingRating) {
            abort(400, 'Anda sudah memberikan ulasan untuk pesanan ini.');
        }

        // Create the rating
        Rating::create([
            'order_id' => $order->id,
            'product_id' => $order->negotiation->product_id,
            'buyer_id' => Auth::id(),
            'seller_id' => $order->seller_id,
            'rating' => $request->input('rating'),
            'review' => $reviewContent,
        ]);

        // Recalculate seller statistics
        $seller = $order->seller;
        $averageRating = Rating::where('seller_id', $seller->id)->avg('rating');
        $totalReviews = Rating::where('seller_id', $seller->id)->count();

        $seller->update([
            'average_rating' => $averageRating ?: 0,
            'total_reviews' => $totalReviews,
        ]);

        return back()->with('message', 'Ulasan berhasil dikirim. Terima kasih!');
    }
}
