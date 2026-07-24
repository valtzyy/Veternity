<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatMessage extends Model
{
    use HasFactory, SoftDeletes;

    public const UPDATED_AT = null;

    protected $fillable = [
        'negotiation_id',
        'sender_id',
        'message',
        'image_url',
        'message_type',
        'offer_price',
        'offer_quantity',
        'offer_status',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'offer_price' => 'decimal:2',
            'offer_quantity' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function negotiation(): BelongsTo
    {
        return $this->belongsTo(Negotiation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
