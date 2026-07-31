<?php

namespace App\Http\Middleware;

use App\Models\Negotiation;
use App\Models\Order;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $quote = Cache::remember('inspiring_quote', 3600, function () {
            [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

            return ['message' => trim($message), 'author' => trim($author)];
        });

        $unreadNegotiationsCount = 0;
        $activeOrdersCount = 0;

        if ($request->user()) {
            $userId = $request->user()->id;
            $role = $request->user()->role;

            // Count active negotiations that need user response (unread messages)
            $negotiations = Negotiation::with(['messages' => function ($q) {
                $q->latest('created_at')->limit(1);
            }])
                ->where(function ($q) use ($userId) {
                    $q->where('buyer_id', $userId)
                        ->orWhere('seller_id', $userId);
                })
                ->whereIn('status', ['pending', 'negotiating'])
                ->get();

            foreach ($negotiations as $nego) {
                $lastMessage = $nego->messages->first();
                if ($lastMessage && $lastMessage->sender_id !== $userId) {
                    $unreadNegotiationsCount++;
                }
            }

            // Count total active orders & pending negotiations
            if ($role === 'buyer') {
                $activeOrdersCount = Order::where('buyer_id', $userId)
                    ->whereIn('status', ['waiting_payment', 'paid', 'processing', 'shipping'])
                    ->count();
                $activeOrdersCount += Negotiation::where('buyer_id', $userId)
                    ->whereIn('status', ['pending', 'negotiating'])
                    ->count();
            } elseif ($role === 'seller') {
                $activeOrdersCount = Order::where('seller_id', $userId)
                    ->where('status', 'paid')
                    ->count();

                $sellerNegos = Negotiation::with(['messages' => function ($q) {
                    $q->latest('created_at')->limit(1);
                }])
                    ->where('seller_id', $userId)
                    ->whereIn('status', ['pending', 'negotiating'])
                    ->get();

                foreach ($sellerNegos as $nego) {
                    $lastMessage = $nego->messages->first();
                    if ($lastMessage && $lastMessage->sender_id !== $userId) {
                        $activeOrdersCount++;
                    }
                }
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => $quote,
            'auth' => [
                'user' => $request->user(),
            ],
            'unread_negotiations_count' => $unreadNegotiationsCount,
            'active_orders_count' => $activeOrdersCount,
        ];
    }
}
