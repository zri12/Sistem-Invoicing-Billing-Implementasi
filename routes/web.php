<?php

use App\Http\Controllers\InvoicePrintController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

// Cetak menampilkan PDF yang sama persis dengan hasil Simpan PDF.
Route::middleware('auth')->get('/invoice/{invoice}/print', [InvoicePrintController::class, 'show'])
    ->name('invoices.print');

// Vue SPA routes (including /login) are rendered by the shared frontend entry.
Route::fallback(function () {
    return view('app');
});
