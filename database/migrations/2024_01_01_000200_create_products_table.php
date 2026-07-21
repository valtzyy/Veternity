<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete()->cascadeOnUpdate();
            $table->string('title');
            $table->text('description');
            $table->decimal('reference_price', 15, 2);
            $table->unsignedInteger('minimum_order')->default(1);
            $table->unsignedInteger('stock')->default(0);
            $table->string('unit', 50);
            $table->string('location');
            $table->enum('condition', ['fresh', 'usable', 'near_expired'])->default('usable');
            $table->timestamp('expired_at')->nullable();
            $table->text('knowledge')->nullable();
            $table->enum('status', ['pending_review', 'available', 'sold_out', 'inactive'])->default('pending_review');
            $table->unsignedInteger('view_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['seller_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
