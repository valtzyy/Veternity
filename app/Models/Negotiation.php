<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Negotiation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'buyer_id',
        'seller_id',
        'agreed_price',
        'agreed_quantity',
        'status',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'agreed_price' => 'decimal:2',
            'agreed_quantity' => 'integer',
            'closed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class);
    }
}
