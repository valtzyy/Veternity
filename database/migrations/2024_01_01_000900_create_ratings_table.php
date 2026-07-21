<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->unsignedTinyInteger('rating');
            $table->text('review');
            $table->text('seller_reply')->nullable();
            $table->timestamp('seller_replied_at')->nullable();
            $table->unsignedInteger('helpful_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['product_id', 'rating']);
            $table->index('buyer_id');
            $table->index('seller_id');
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
