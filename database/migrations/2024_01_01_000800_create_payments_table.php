<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete()->cascadeOnUpdate();
            $table->string('midtrans_order_id', 100)->nullable();
            $table->string('transaction_id', 100)->nullable()->unique();
            $table->string('payment_method', 50);
            $table->decimal('gross_amount', 15, 2);
            $table->string('payment_proof')->nullable();
            $table->enum('status', ['pending', 'paid', 'failed', 'expired', 'cancelled'])->default('pending');
            $table->text('payment_gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('failed_reason')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('order_id');
            $table->index('transaction_id');
            $table->index('midtrans_order_id');
            $table->index('status');
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
