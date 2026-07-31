<?php

namespace App\Services;

use App\Models\Negotiation;
use App\Models\User;

class TransactionLifecycleService
{
    /**
     * Get the single unified status string for a given negotiation and its order.
     * Statuses: 'Menunggu' | 'Negosiasi' | 'Pembayaran' | 'Pickup' | 'Selesai' | 'Batal'
     */
    public static function getStatus(Negotiation $negotiation): string
    {
        $order = $negotiation->relationLoaded('order') ? $negotiation->order : $negotiation->order()->first();

        if ($order) {
            return match ($order->status) {
                'waiting_payment' => 'Pembayaran',
                'paid', 'processing', 'shipping' => 'Pickup',
                'completed' => 'Selesai',
                'cancelled' => 'Batal',
                default => 'Pembayaran',
            };
        }

        return match ($negotiation->status) {
            'agreed' => 'Pembayaran',
            'negotiating' => 'Negosiasi',
            'pending' => 'Menunggu',
            'cancelled' => 'Batal',
            default => 'Menunggu',
        };
    }

    /**
     * Get numeric step index (0 to 4) corresponding to status.
     */
    public static function getStep(string $status): int
    {
        return match ($status) {
            'Menunggu' => 0,
            'Negosiasi' => 1,
            'Pembayaran' => 2,
            'Pickup' => 3,
            'Selesai' => 4,
            default => 0,
        };
    }

    /**
     * Get permission rules for Seller based on transaction status.
     */
    public static function getSellerPermissions(string $status): array
    {
        return match ($status) {
            'Menunggu', 'Negosiasi' => [
                'can_chat' => true,
                'can_offer' => true,
            ],
            'Pembayaran', 'Pickup' => [
                'can_chat' => true,
                'can_offer' => false,
            ],
            'Selesai', 'Batal' => [
                'can_chat' => false,
                'can_offer' => false,
            ],
            default => [
                'can_chat' => false,
                'can_offer' => false,
            ],
        };
    }

    /**
     * Get permission rules for Buyer based on transaction status.
     */
    public static function getBuyerPermissions(string $status): array
    {
        return match ($status) {
            'Menunggu', 'Negosiasi' => [
                'can_chat' => true,
                'can_offer' => true,
            ],
            'Pembayaran', 'Pickup' => [
                'can_chat' => true,
                'can_offer' => false,
            ],
            'Selesai', 'Batal' => [
                'can_chat' => false,
                'can_offer' => false,
            ],
            default => [
                'can_chat' => false,
                'can_offer' => false,
            ],
        };
    }

    /**
     * Format a negotiation item into standard transaction DTO for frontend components.
     */
    public static function formatTransaction(Negotiation $item, User|int $user): array
    {
        $product = $item->product;
        $order = $item->relationLoaded('order') ? $item->order : $item->order()->first();
        $isSeller = is_object($user) ? $user->isSeller() : (User::find($user)?->isSeller() ?? false);

        $status = self::getStatus($item);
        $step = self::getStep($status);

        $priceVal = $item->agreed_price ?? ($product->reference_price ?? 0);
        $qtyVal = $item->agreed_quantity ?? ($product->minimum_order ?? 1);
        $unitStr = $product->unit ?? 'kg';

        $priceFormatted = 'Rp '.number_format($priceVal * $qtyVal, 0, ',', '.');
        $dateFormatted = $item->updated_at ? $item->updated_at->format('d M Y') : now()->format('d M Y');

        $code = 'REG-NEGO-'.str_pad($item->id, 4, '0', STR_PAD_LEFT);
        if ($order && $order->order_number) {
            $code = $order->order_number;
        }

        $button = null;
        $actionUrl = route('negotiations.show', $item->id);
        $completeUrl = null;

        if ($isSeller) {
            // SELLER RULE: On all transaction statuses (Menunggu, Negosiasi, Pembayaran, Pickup, Selesai)
            // Seller ONLY has 1 action button: "Lihat Chat"
            $button = 'Lihat Chat';
            $actionUrl = route('negotiations.show', $item->id);
        } else {
            // BUYER FLOW
            switch ($status) {
                case 'Pembayaran':
                    $button = 'Bayar Sekarang';
                    $actionUrl = $order ? route('orders.payment', $order->id) : route('negotiations.checkout', $item->id);
                    break;

                case 'Pickup':
                    $invoice = $order?->invoice;
                    $button = $invoice ? 'Lihat Invoice' : 'Detail';
                    $actionUrl = $invoice ? route('invoices.show', $invoice->id) : route('negotiations.show', $item->id);
                    $completeUrl = $order ? route('orders.complete', $order->id) : null;
                    break;

                case 'Selesai':
                    $hasReviewed = false;
                    if ($order) {
                        $hasReviewed = $order->relationLoaded('rating') ? (bool) $order->rating : $order->rating()->exists();
                    }
                    $button = $hasReviewed ? 'Lihat Chat' : 'Beri Ulasan';
                    $actionUrl = route('negotiations.show', $item->id);
                    break;

                case 'Negosiasi':
                case 'Menunggu':
                    $button = 'Lihat Chat';
                    $actionUrl = route('negotiations.show', $item->id);
                    break;

                case 'Batal':
                default:
                    $button = null;
                    $actionUrl = route('negotiations.show', $item->id);
                    break;
            }
        }

        $hasReviewed = false;
        if ($order) {
            $hasReviewed = $order->relationLoaded('rating') ? (bool) $order->rating : $order->rating()->exists();
        }

        return [
            'id' => $item->id,
            'negotiation_id' => $item->id,
            'order_id' => $order ? $order->id : null,
            'code' => $code,
            'name' => $product->title ?? 'Produk Limbah Pangan',
            'seller' => $item->seller->name ?? 'Supplier',
            'buyer' => $item->buyer->name ?? 'Buyer',
            'qty' => $qtyVal.' '.$unitStr,
            'price' => $priceFormatted,
            'date' => $dateFormatted,
            'status' => $status,
            'step' => $step,
            'button' => $button,
            'action_url' => $actionUrl,
            'detail_url' => route('products.show', $product->id),
            'complete_url' => $completeUrl,
            'has_reviewed' => $hasReviewed,
            'nego' => true,
        ];
    }
}
