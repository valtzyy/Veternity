<?php

use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NegotiationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Negotiation routes
    Route::get('/negotiations', [NegotiationController::class, 'index'])->name('negotiations.index');
    Route::post('/negotiations', [NegotiationController::class, 'store'])->name('negotiations.store');
    Route::get('/negotiations/{negotiation}', [NegotiationController::class, 'show'])->name('negotiations.show');

    // Chat messages & offer actions
    Route::post('/negotiations/{negotiation}/messages', [ChatMessageController::class, 'store'])->name('negotiations.messages.store');
    Route::post('/negotiations/{negotiation}/messages/{chatMessage}/accept', [ChatMessageController::class, 'acceptOffer'])->name('negotiations.messages.accept');
    Route::post('/negotiations/{negotiation}/messages/{chatMessage}/reject', [ChatMessageController::class, 'rejectOffer'])->name('negotiations.messages.reject');
    Route::post('/negotiations/{negotiation}/messages/{chatMessage}/counter', [ChatMessageController::class, 'counterOffer'])->name('negotiations.messages.counter');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
