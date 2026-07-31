<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Negotiation;
use App\Models\Order;
use App\Models\Product;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerReviewTest extends TestCase
{
    use RefreshDatabase;

    private User $seller;

    private User $buyer;

    private Category $category;

    private Product $product;

    private Order $order;

    private Rating $rating;

    protected function setUp(): void
    {
        parent::setUp();

        // Create testing entities
        $this->seller = User::factory()->seller()->create();
        $this->buyer = User::factory()->buyer()->create();

        $this->category = Category::create([
            'name' => 'Test Category',
            'description' => 'Test Description',
            'icon' => 'coffee',
        ]);

        $this->product = Product::create([
            'seller_id' => $this->seller->id,
            'category_id' => $this->category->id,
            'title' => 'Test Product',
            'description' => 'Test Product Description',
            'reference_price' => 1000,
            'minimum_order' => 1,
            'stock' => 10,
            'unit' => 'kg',
            'location' => 'Jakarta',
            'condition' => 'usable',
            'status' => 'available',
        ]);

        $negotiation = Negotiation::create([
            'product_id' => $this->product->id,
            'buyer_id' => $this->buyer->id,
            'seller_id' => $this->seller->id,
            'agreed_price' => 1000,
            'agreed_quantity' => 1,
            'status' => 'agreed',
        ]);

        $this->order = Order::create([
            'negotiation_id' => $negotiation->id,
            'seller_id' => $this->seller->id,
            'buyer_id' => $this->buyer->id,
            'order_number' => 'ORD-TEST-001',
            'final_price' => 1000,
            'final_quantity' => 1,
            'receiver_name' => $this->buyer->name,
            'receiver_phone' => '0812345678',
            'shipping_address' => 'Test Address',
            'status' => 'completed',
            'payment_method' => 'cod',
        ]);

        $this->rating = Rating::create([
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'buyer_id' => $this->buyer->id,
            'seller_id' => $this->seller->id,
            'rating' => 5,
            'review' => 'Great product!',
        ]);
    }

    public function test_seller_can_view_reviews_page(): void
    {
        $response = $this->actingAs($this->seller)
            ->get(route('seller.reviews.index'));

        $response->assertStatus(200);
    }

    public function test_buyer_cannot_view_seller_reviews_page(): void
    {
        $response = $this->actingAs($this->buyer)
            ->get(route('seller.reviews.index'));

        $response->assertStatus(403);
    }

    public function test_guest_cannot_view_seller_reviews_page(): void
    {
        $response = $this->get(route('seller.reviews.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_seller_can_reply_to_review(): void
    {
        $response = $this->actingAs($this->seller)
            ->post(route('seller.reviews.reply', $this->rating->id), [
                'seller_reply' => 'Thank you for your purchase!',
            ]);

        $response->assertRedirect();

        $this->rating->refresh();
        $this->assertEquals('Thank you for your purchase!', $this->rating->seller_reply);
        $this->assertNotNull($this->rating->seller_replied_at);
    }

    public function test_seller_cannot_reply_to_other_sellers_review(): void
    {
        $otherSeller = User::factory()->seller()->create();

        $response = $this->actingAs($otherSeller)
            ->post(route('seller.reviews.reply', $this->rating->id), [
                'seller_reply' => 'Sneaky reply attempt.',
            ]);

        $response->assertStatus(403);
    }
}
