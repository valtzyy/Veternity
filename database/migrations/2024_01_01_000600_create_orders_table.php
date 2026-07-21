<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('negotiation_id')->unique()->constrained('negotiations')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('order_number', 50)->unique();
            $table->decimal('final_price', 15, 2);
            $table->unsignedInteger('final_quantity');
            $table->string('receiver_name');
            $table->string('receiver_phone', 20);
            $table->text('shipping_address');
            $table->text('notes')->nullable();
            $table->enum('status', ['waiting_payment', 'paid', 'processing', 'shipping', 'completed', 'cancelled'])->default('waiting_payment');
            $table->string('payment_method', 50)->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancelled_reason')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['seller_id', 'status']);
            $table->index(['buyer_id', 'status']);
            $table->index('order_number');
            $table->index('negotiation_id');
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
