<?php

use App\Http\Controllers\InvoicePrintController;
use App\Http\Controllers\CompanyAssetController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::view('/login', 'app')->name('login');

// Cetak menampilkan PDF yang sama persis dengan hasil Simpan PDF.
Route::middleware('auth')->get('/invoice/{invoice}/print', [InvoicePrintController::class, 'show'])
    ->name('invoices.print');

Route::middleware('auth')->get('/company/assets/{field}', [CompanyAssetController::class, 'show'])
    ->name('company.assets');

// Vue SPA routes (including /login) are rendered by the shared frontend entry.
Route::fallback(function () {
    return view('app');
});
