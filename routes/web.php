<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\OcrController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Demo-friendly routing: if APP_DEMO=true in your .env the app will show
// the Dashboard at the root URL without requiring authentication. This
// keeps the normal auth-protected routes intact when APP_DEMO is false.
if (env('APP_DEMO', false)) {
    Route::get('/', function () {
        return Inertia::render('Dashboard');
    });

    // Expose dashboard without auth for demo purposes
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
} else {
    Route::get('/', function () {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    });

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware(['auth', 'verified'])->name('dashboard');
}

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Tenants CRUD routes (Inertia)
    Route::get('/tenants', [TenantController::class, 'index'])->name('tenants.index');
    Route::get('/tenants/create', [TenantController::class, 'create'])->name('tenants.create');
    Route::post('/tenants', [TenantController::class, 'store'])->name('tenants.store');
    Route::get('/tenants/{tenant}', [TenantController::class, 'edit'])->name('tenants.edit');
    Route::put('/tenants/{tenant}', [TenantController::class, 'update'])->name('tenants.update');
    Route::delete('/tenants/{tenant}', [TenantController::class, 'destroy'])->name('tenants.destroy');

    // Rooms CRUD routes (Inertia)
    Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
    Route::get('/rooms/create', [RoomController::class, 'create'])->name('rooms.create');
    Route::post('/rooms', [RoomController::class, 'store'])->name('rooms.store');
    Route::get('/rooms/{room}', [RoomController::class, 'edit'])->name('rooms.edit');
    Route::put('/rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');

    // Bills CRUD routes (Inertia)
    Route::get('/bills', [BillController::class, 'index'])->name('bills.index');
    Route::get('/bills/create', [BillController::class, 'create'])->name('bills.create');
    Route::post('/bills', [BillController::class, 'store'])->name('bills.store');
    Route::get('/bills/{bill}', [BillController::class, 'edit'])->name('bills.edit');
    Route::put('/bills/{bill}', [BillController::class, 'update'])->name('bills.update');
    Route::delete('/bills/{bill}', [BillController::class, 'destroy'])->name('bills.destroy');

    // Room map page (Inertia) — protected route so only authenticated users can view the layout.
    Route::get('/map', function () {
        return Inertia::render('Map');
    })->name('map');

    // POST endpoint for OCR uploads (supports both local and online methods)
    Route::post('/ocr', [OcrController::class, 'upload'])->name('ocr.upload');

// Demo OCR page for testing Chandra integration (visible to authenticated users).
Route::get('/ocr-demo', function () {
    return Inertia::render('OcrDemo');
})->middleware('auth')->name('ocr.demo');
});

require __DIR__.'/auth.php';
