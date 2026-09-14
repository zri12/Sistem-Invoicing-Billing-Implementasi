<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\IncomeController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\InvoiceNumberSettingController;
use App\Http\Controllers\Api\InvoiceTemplateSettingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductServiceController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Middleware\ReleaseReadOnlySession;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Business endpoints are registered below.
|
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', ReleaseReadOnlySession::class])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/clients/{client}/invoices', [ClientController::class, 'invoices']);
    Route::patch('/clients/{client}/status', [ClientController::class, 'updateStatus']);
    Route::apiResource('clients', ClientController::class)->except(['destroy']);

    Route::get('/vendors/{vendor}/expenses', [VendorController::class, 'expenses']);
    Route::patch('/vendors/{vendor}/status', [VendorController::class, 'updateStatus']);
    Route::apiResource('vendors', VendorController::class)->except(['destroy']);

    Route::patch('/products-services/{product_service}/status', [ProductServiceController::class, 'updateStatus']);
    Route::apiResource('products-services', ProductServiceController::class)
        ->except(['destroy'])
        ->parameters(['products-services' => 'product_service']);

    Route::patch('/accounts/{account}/status', [AccountController::class, 'updateStatus']);
    Route::apiResource('accounts', AccountController::class)->except(['destroy']);

    Route::post('/invoices/{invoice}/publish', [InvoiceController::class, 'publish']);
    Route::post('/invoices/{invoice}/cancel', [InvoiceController::class, 'cancel']);
    Route::get('/invoices/{invoice}/preview', [InvoiceController::class, 'preview']);
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);
    Route::apiResource('invoices', InvoiceController::class)->except(['destroy']);

    Route::get('/billing', [BillingController::class, 'index']);
    Route::get('/billing/{invoice}', [BillingController::class, 'show']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/invoices/{invoice}/payments', [PaymentController::class, 'storeForInvoice']);
    Route::get('/invoices/{invoice}/payments', [PaymentController::class, 'indexForInvoice']);

    Route::get('/incomes', [IncomeController::class, 'index']);
    Route::post('/incomes', [IncomeController::class, 'store']);
    Route::put('/incomes/{income}', [IncomeController::class, 'update']);

    Route::apiResource('expenses', ExpenseController::class)->except(['destroy']);

    Route::get('/reports/cashbook', [ReportController::class, 'cashbook']);
    Route::get('/reports/invoices', [ReportController::class, 'invoices']);
    Route::get('/reports/payments', [ReportController::class, 'payments']);
    Route::get('/reports/incomes', [ReportController::class, 'incomes']);
    Route::get('/reports/expenses', [ReportController::class, 'expenses']);

    Route::get('/company', [CompanyController::class, 'show']);
    Route::put('/company', [CompanyController::class, 'update']);

    Route::get('/settings/invoice-template/preview', [InvoiceTemplateSettingController::class, 'preview']);
    Route::get('/settings/invoice-template', [InvoiceTemplateSettingController::class, 'show']);
    Route::put('/settings/invoice-template', [InvoiceTemplateSettingController::class, 'update']);

    Route::get('/settings/invoice-numbering', [InvoiceNumberSettingController::class, 'show']);
    Route::put('/settings/invoice-numbering', [InvoiceNumberSettingController::class, 'update']);

    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
    Route::apiResource('users', UserController::class)->except(['destroy']);
});
