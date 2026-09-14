<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\ClientResource;
use App\Http\Resources\CompanyResource;
use App\Http\Resources\ExpenseResource;
use App\Http\Resources\IncomeResource;
use App\Http\Resources\InvoiceNumberSettingResource;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\InvoiceTemplateSettingResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\ProductServiceResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\VendorResource;
use App\Models\Account;
use App\Models\Client;
use App\Models\Company;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Invoice;
use App\Models\InvoiceNumberSetting;
use App\Models\InvoiceTemplateSetting;
use App\Models\Payment;
use App\Models\ProductService;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponses;

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        $user = User::where('username', $credentials['username'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah.'],
            ]);
        }

        if ($user->status !== 'aktif') {
            throw ValidationException::withMessages([
                'username' => ['Akun tidak aktif.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return $this->success([
            ...(new UserResource($user))->resolve($request),
            'bootstrap' => $this->applicationData($request),
        ], 'Login berhasil.');
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->success(null, 'Logout berhasil.');
    }

    public function me(Request $request)
    {
        return $this->success(new UserResource($request->user()), 'OK');
    }

    private function applicationData(Request $request): array
    {
        $company = Company::query()->first()
            ?? Company::create(['name' => 'PT. Ruang Kreasi Aplikasi'])->refresh();
        $template = InvoiceTemplateSetting::query()->first()
            ?? InvoiceTemplateSetting::create([])->refresh();
        $numbering = InvoiceNumberSetting::query()->first()
            ?? InvoiceNumberSetting::create([])->refresh();

        return [
            'invoices' => InvoiceResource::collection(
                Invoice::query()->with(['client', 'paymentAccount'])->latest('invoice_date')->limit(200)->get()
            )->resolve($request),
            'payments' => PaymentResource::collection(
                Payment::query()->with(['account', 'invoice.client'])->latest('payment_date')->limit(200)->get()
            )->resolve($request),
            'incomes' => IncomeResource::collection(
                Income::query()->with('invoice.client')->latest('income_date')->limit(200)->get()
            )->resolve($request),
            'expenses' => ExpenseResource::collection(
                Expense::query()->with('vendor')->latest('expense_date')->limit(200)->get()
            )->resolve($request),
            'clients' => ClientResource::collection(
                Client::query()->withCount('invoices')->orderBy('name')->limit(100)->get()
            )->resolve($request),
            'vendors' => VendorResource::collection(
                Vendor::query()->withCount('expenses')->orderBy('name')->limit(100)->get()
            )->resolve($request),
            'products' => ProductServiceResource::collection(
                ProductService::query()->orderBy('name')->limit(100)->get()
            )->resolve($request),
            'accounts' => AccountResource::collection(
                Account::query()->orderBy('name')->limit(100)->get()
            )->resolve($request),
            'company' => (new CompanyResource($company))->resolve($request),
            'template' => (new InvoiceTemplateSettingResource($template))->resolve($request),
            'numbering' => (new InvoiceNumberSettingResource($numbering))->resolve($request),
        ];
    }
}
