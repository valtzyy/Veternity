<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('negotiation_id')->constrained('negotiations')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->text('message')->nullable();
            $table->string('image_url')->nullable();
            $table->enum('message_type', ['text', 'image', 'offer', 'system'])->default('text');
            $table->decimal('offer_price', 15, 2)->nullable();
            $table->unsignedInteger('offer_quantity')->nullable();
            $table->enum('offer_status', ['pending', 'accepted', 'rejected', 'countered'])->nullable();
            $table->softDeletes();
            $table->timestamp('created_at')->nullable();

            $table->index(['negotiation_id', 'message_type', 'created_at']);
            $table->index('sender_id');
            $table->index('message_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
