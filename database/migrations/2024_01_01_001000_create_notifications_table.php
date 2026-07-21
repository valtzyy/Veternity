<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['negotiation', 'offer', 'order', 'payment', 'system', 'rating']);
            $table->string('action_url')->nullable();
            $table->boolean('is_read')->default(false);
            $table->softDeletes();
            $table->timestamp('created_at')->nullable();

            $table->index(['user_id', 'is_read', 'created_at']);
            $table->index(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
