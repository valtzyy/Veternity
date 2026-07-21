<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->enum('role', ['buyer', 'seller', 'admin'])->default('buyer');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('profile_photo')->nullable();
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->decimal('response_rate', 5, 2)->nullable();
            $table->boolean('is_verified')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['role', 'created_at']);
            $table->index('average_rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
