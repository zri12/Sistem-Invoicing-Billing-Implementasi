<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Client;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\ProductService;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationPolicyTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $manager;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->manager = User::factory()->create(['role' => 'manager']);
    }

    public function test_client_policy(): void
    {
        $client = Client::factory()->create();
        $this->assertTrue($this->admin->can('viewAny', Client::class));
        $this->assertTrue($this->manager->can('viewAny', Client::class));
        $this->assertTrue($this->admin->can('create', Client::class));
        $this->assertFalse($this->manager->can('create', Client::class));
        $this->assertFalse($this->manager->can('update', $client));
        $this->assertFalse($this->manager->can('changeStatus', $client));
    }

    public function test_vendor_policy(): void
    {
        $vendor = Vendor::factory()->create();
        $this->assertTrue($this->manager->can('viewAny', Vendor::class));
        $this->assertTrue($this->admin->can('create', Vendor::class));
        $this->assertFalse($this->manager->can('create', Vendor::class));
        $this->assertFalse($this->manager->can('update', $vendor));
    }

    public function test_product_service_policy(): void
    {
        $product = ProductService::factory()->create();
        $this->assertTrue($this->manager->can('viewAny', ProductService::class));
        $this->assertTrue($this->admin->can('update', $product));
        $this->assertFalse($this->manager->can('update', $product));
        $this->assertFalse($this->manager->can('changeStatus', $product));
    }

    public function test_account_policy(): void
    {
        $account = Account::factory()->create();
        $this->assertTrue($this->manager->can('viewAny', Account::class));
        $this->assertTrue($this->admin->can('create', Account::class));
        $this->assertFalse($this->manager->can('create', Account::class));
    }

    public function test_invoice_policy(): void
    {
        $invoice = Invoice::factory()->create();
        $this->assertTrue($this->manager->can('view', $invoice));
        $this->assertTrue($this->admin->can('create', Invoice::class));
        $this->assertFalse($this->manager->can('create', Invoice::class));
        $this->assertFalse($this->manager->can('update', $invoice));
        $this->assertTrue($this->admin->can('publish', $invoice));
        $this->assertFalse($this->manager->can('publish', $invoice));
        $this->assertTrue($this->admin->can('cancel', $invoice));
        $this->assertFalse($this->manager->can('cancel', $invoice));
    }

    public function test_payment_policy(): void
    {
        $payment = Payment::factory()->create();
        $this->assertTrue($this->manager->can('view', $payment));
        $this->assertTrue($this->admin->can('create', Payment::class));
        $this->assertFalse($this->manager->can('create', Payment::class));
    }

    public function test_income_policy(): void
    {
        $income = Income::factory()->create();
        $this->assertTrue($this->manager->can('view', $income));
        $this->assertTrue($this->admin->can('create', Income::class));
        $this->assertFalse($this->manager->can('create', Income::class));
        $this->assertFalse($this->manager->can('update', $income));
    }

    public function test_expense_policy(): void
    {
        $expense = Expense::factory()->create();
        $this->assertTrue($this->manager->can('view', $expense));
        $this->assertTrue($this->admin->can('create', Expense::class));
        $this->assertFalse($this->manager->can('create', Expense::class));
    }

    public function test_company_policy(): void
    {
        $this->assertTrue($this->manager->can('view', \App\Models\Company::class));
        $this->assertTrue($this->admin->can('update', \App\Models\Company::class));
        $this->assertFalse($this->manager->can('update', \App\Models\Company::class));
    }

    public function test_invoice_template_setting_policy_allows_manager_read_only(): void
    {
        $this->assertTrue($this->manager->can('view', \App\Models\InvoiceTemplateSetting::class));
        $this->assertTrue($this->admin->can('update', \App\Models\InvoiceTemplateSetting::class));
        $this->assertFalse($this->manager->can('update', \App\Models\InvoiceTemplateSetting::class));
    }

    public function test_invoice_number_setting_policy_allows_manager_read_only(): void
    {
        $this->assertTrue($this->manager->can('view', \App\Models\InvoiceNumberSetting::class));
        $this->assertFalse($this->manager->can('update', \App\Models\InvoiceNumberSetting::class));
    }

    public function test_user_policy_denies_manager_entirely(): void
    {
        $this->assertTrue($this->admin->can('viewAny', User::class));
        $this->assertFalse($this->manager->can('viewAny', User::class));
        $this->assertFalse($this->manager->can('view', $this->admin));
        $this->assertFalse($this->manager->can('create', User::class));
        $this->assertFalse($this->manager->can('update', $this->admin));
        $this->assertFalse($this->manager->can('changeStatus', $this->admin));
    }
}
