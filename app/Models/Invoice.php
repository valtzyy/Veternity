<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id',
        'invoice_number',
        'order_number',
        'gross_amount',
        'tax_amount',
        'discount_amount',
        'final_amount',
        'invoice_url',
        'payment_method',
        'notes',
        'generated_at',
        'paid_at',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'gross_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'final_amount' => 'decimal:2',
            'generated_at' => 'datetime',
            'paid_at' => 'datetime',
            'due_date' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
