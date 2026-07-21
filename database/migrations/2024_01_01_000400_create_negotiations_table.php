<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('negotiations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->decimal('agreed_price', 15, 2)->nullable();
            $table->unsignedInteger('agreed_quantity')->nullable();
            $table->enum('status', ['pending', 'negotiating', 'agreed', 'cancelled'])->default('pending');
            $table->timestamp('closed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['buyer_id', 'status']);
            $table->index(['seller_id', 'status']);
            $table->index('product_id');
            $table->index(['status', 'closed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('negotiations');
    }
};
