<?php

use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\BillController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/rooms/map', [RoomController::class, 'map']);

// RESTful room endpoints used by the frontend (index, create, delete)
Route::apiResource('rooms', RoomController::class)->only(['index', 'store', 'update', 'destroy']);

// Bill creation via controller (creates a Bill for the room's tenant if present).
Route::post('/rooms/{room}/bills', [BillController::class, 'store']);

// Chandra OCR endpoint: accepts multipart/form-data file upload under the key `file`.
// Runs the Python `scripts/chandra_ocr.py` script and returns extracted text.
Route::post('/ocr', [\App\Http\Controllers\ChandraController::class, 'upload']);