<?php

namespace Tests\Feature;

use App\Models\Negotiation;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCompleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_complete_order_when_status_is_paid(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $product = Product::factory()->create(['seller_id' => $seller->id]);

        $negotiation = Negotiation::create([
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'status' => 'agreed',
            'agreed_price' => 50000,
            'agreed_quantity' => 10,
        ]);

        $order = Order::create([
            'negotiation_id' => $negotiation->id,
            'seller_id' => $seller->id,
            'buyer_id' => $buyer->id,
            'order_number' => 'REG-20260730-0001',
            'final_price' => 50000,
            'final_quantity' => 10,
            'receiver_name' => 'John Doe',
            'receiver_phone' => '08123456789',
            'shipping_address' => 'Jl. Test No. 123',
            'status' => 'paid',
        ]);

        $response = $this->actingAs($buyer)
            ->patch(route('orders.complete', $order->id));

        $response->assertRedirect(route('buyer.orders'));
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'completed',
        ]);
    }

    public function test_non_buyer_cannot_complete_order(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $otherUser = User::factory()->create(['role' => 'buyer']);
        $product = Product::factory()->create(['seller_id' => $seller->id]);

        $negotiation = Negotiation::create([
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'status' => 'agreed',
        ]);

        $order = Order::create([
            'negotiation_id' => $negotiation->id,
            'seller_id' => $seller->id,
            'buyer_id' => $buyer->id,
            'order_number' => 'REG-20260730-0002',
            'final_price' => 50000,
            'final_quantity' => 10,
            'receiver_name' => 'John Doe',
            'receiver_phone' => '08123456789',
            'shipping_address' => 'Jl. Test No. 123',
            'status' => 'paid',
        ]);

        $response = $this->actingAs($otherUser)
            ->patch(route('orders.complete', $order->id));

        $response->assertStatus(403);
    }

    public function test_cannot_complete_order_if_not_in_paid_status(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $product = Product::factory()->create(['seller_id' => $seller->id]);

        $negotiation = Negotiation::create([
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'status' => 'agreed',
        ]);

        $order = Order::create([
            'negotiation_id' => $negotiation->id,
            'seller_id' => $seller->id,
            'buyer_id' => $buyer->id,
            'order_number' => 'REG-20260730-0003',
            'final_price' => 50000,
            'final_quantity' => 10,
            'receiver_name' => 'John Doe',
            'receiver_phone' => '08123456789',
            'shipping_address' => 'Jl. Test No. 123',
            'status' => 'waiting_payment',
        ]);

        $response = $this->actingAs($buyer)
            ->patch(route('orders.complete', $order->id));

        $response->assertSessionHasErrors(['message']);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'waiting_payment',
        ]);
    }
}
