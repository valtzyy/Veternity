<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('image_url');
            $table->boolean('is_primary')->default(false);
            $table->softDeletes();
            $table->timestamp('created_at')->nullable();

            $table->index(['product_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
