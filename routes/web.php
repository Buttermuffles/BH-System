<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\OcrController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;






    // Electrical Bill Receipt Calculator (no database)
    // Home: show public bill receipt page
    Route::get('/', function () {
        return Inertia::render('ElectricalBillReceipt');
    })->name('home');

    Route::get('/electrical-bill-receipt', function () {
        return Inertia::render('ElectricalBillReceipt');
    })->name('electrical.bill.receipt');

    // Simple Bill Receipt page (public, no auth/database) - render public electrical UI
    Route::get('/bill-receipt', function () {
        return Inertia::render('ElectricalBillReceiptPublic');
    })->name('bill.receipt');

