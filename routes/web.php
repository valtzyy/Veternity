<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NegotiationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RatingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/marketplace', [HomeController::class, 'marketplace'])->name('marketplace');
Route::get('/products/{product}', [HomeController::class, 'show'])->name('products.show');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::get('/products', [AdminController::class, 'products'])->name('products');
        Route::patch('/products/{product}/approve', [AdminController::class, 'approve'])->name('products.approve');
        Route::patch('/products/{product}/reject', [AdminController::class, 'reject'])->name('products.reject');
    });

    // Seller routes
    Route::middleware(['seller'])->prefix('seller')->name('seller.')->group(function () {
        Route::resource('products', ProductController::class);
    });

    // Negotiation routes
    Route::get('/negotiations', [NegotiationController::class, 'index'])->name('negotiations.index');
    Route::post('/negotiations', [NegotiationController::class, 'store'])->name('negotiations.store');
    Route::get('/buyer/orders', [NegotiationController::class, 'buyerOrders'])->name('buyer.orders');

    // Favorite routes
    Route::get('/buyer/favorites', [FavoriteController::class, 'index'])->name('buyer.favorites');
    Route::post('/products/{product}/favorite', [FavoriteController::class, 'toggle'])->name('products.favorite');
    Route::get('/negotiations/{negotiation}', [NegotiationController::class, 'show'])->name('negotiations.show');

    // Checkout & Payment simulation
    Route::get('/negotiations/{negotiation}/checkout', [PaymentController::class, 'showCheckout'])->name('negotiations.checkout');
    Route::post('/negotiations/{negotiation}/checkout', [PaymentController::class, 'processCheckout'])->name('negotiations.checkout.store');
    Route::get('/orders/{order}/payment', [PaymentController::class, 'showPayment'])->name('orders.payment');
    Route::post('/orders/{order}/payment', [PaymentController::class, 'processPayment'])->name('orders.payment.store');
    Route::get('/invoices/{invoice}', [PaymentController::class, 'showInvoice'])->name('invoices.show');
    Route::post('/orders/{order}/ratings', [RatingController::class, 'store'])->name('orders.ratings.store');

    // Chat messages & offer actions
    Route::post('/negotiations/{negotiation}/messages', [ChatMessageController::class, 'store'])->name('negotiations.messages.store');
    Route::post('/negotiations/{negotiation}/messages/{chatMessage}/accept', [ChatMessageController::class, 'acceptOffer'])->name('negotiations.messages.accept');
    Route::post('/negotiations/{negotiation}/messages/{chatMessage}/reject', [ChatMessageController::class, 'rejectOffer'])->name('negotiations.messages.reject');
    Route::post('/negotiations/{negotiation}/messages/{chatMessage}/counter', [ChatMessageController::class, 'counterOffer'])->name('negotiations.messages.counter');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
