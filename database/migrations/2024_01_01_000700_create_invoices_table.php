<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('invoice_number', 50)->unique();
            $table->string('order_number', 50);
            $table->decimal('gross_amount', 15, 2);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('final_amount', 15, 2);
            $table->string('invoice_url')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('generated_at');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('invoice_number');
            $table->index('order_id');
            $table->index('generated_at');
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
