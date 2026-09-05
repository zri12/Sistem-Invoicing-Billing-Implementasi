<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Client;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Tests\TestCase;

class B1SchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_migrate_fresh_creates_all_business_tables(): void
    {
        $tables = [
            'users', 'companies', 'clients', 'vendors', 'products_services', 'accounts',
            'invoice_number_settings', 'invoice_template_settings', 'invoices',
            'invoice_items', 'payments', 'incomes', 'expenses', 'personal_access_tokens',
        ];

        foreach ($tables as $table) {
            $this->assertTrue(
                DB::getSchemaBuilder()->hasTable($table),
                "Expected table [$table] to exist."
            );
        }
    }

    public function test_client_has_many_invoices(): void
    {
        $client = Client::factory()->create();
        $invoice = Invoice::factory()->for($client)->create();

        $this->assertTrue($client->invoices->contains($invoice));
        $this->assertSame($client->id, $invoice->client->id);
    }

    public function test_invoice_has_many_items_and_payments(): void
    {
        $invoice = Invoice::factory()->published()->create();
        InvoiceItem::factory()->for($invoice)->count(2)->create();
        $payment = Payment::factory()->for($invoice)->create();

        $this->assertCount(2, $invoice->fresh()->items);
        $this->assertTrue($invoice->fresh()->payments->contains($payment));
    }

    public function test_payment_can_have_one_linked_income_and_duplicate_is_rejected(): void
    {
        $payment = Payment::factory()->create();
        $account = Account::factory()->create();

        $income = Income::create([
            'income_date' => now()->toDateString(),
            'source_type' => 'invoice',
            'source' => 'invoice',
            'payment_id' => $payment->id,
            'invoice_id' => $payment->invoice_id,
            'category' => 'Pendapatan Jasa',
            'description' => 'Pembayaran invoice',
            'amount' => $payment->amount,
            'account_id' => $account->id,
        ]);

        $this->assertSame($payment->id, $income->payment->id);

        $this->expectException(QueryException::class);
        Income::create([
            'income_date' => now()->toDateString(),
            'source_type' => 'invoice',
            'source' => 'invoice',
            'payment_id' => $payment->id,
            'invoice_id' => $payment->invoice_id,
            'category' => 'Pendapatan Jasa',
            'description' => 'Duplicate income for same payment',
            'amount' => $payment->amount,
            'account_id' => $account->id,
        ]);
    }

    public function test_invoice_number_must_be_unique(): void
    {
        Invoice::factory()->create(['invoice_number' => '001/INV/RKA/VIII/26']);

        $this->expectException(QueryException::class);
        Invoice::factory()->create(['invoice_number' => '001/INV/RKA/VIII/26']);
    }

    public function test_username_must_be_unique(): void
    {
        User::factory()->create(['username' => 'fazrilukman']);

        $this->expectException(QueryException::class);
        User::factory()->create(['username' => 'fazrilukman']);
    }

    public function test_vendor_has_many_expenses(): void
    {
        $vendor = Vendor::factory()->create();
        $expense = Expense::factory()->transfer()->for($vendor)->create();

        $this->assertTrue($vendor->expenses->contains($expense));
        $this->assertSame('transfer', $expense->transaction_type);
        $this->assertNotNull($expense->destination_account);
    }

    public function test_account_relations_resolve(): void
    {
        $account = Account::factory()->create();
        Payment::factory()->for($account)->create();
        Income::factory()->for($account)->create();
        Expense::factory()->create(['source_account_id' => $account->id]);

        $this->assertCount(1, $account->fresh()->payments);
        $this->assertCount(1, $account->fresh()->incomes);
        $this->assertCount(1, $account->fresh()->expensesAsSource);
    }

    public function test_inactive_client_remains_readable_through_historical_invoice(): void
    {
        $client = Client::factory()->inactive()->create();
        $invoice = Invoice::factory()->for($client)->published()->create();

        $this->assertSame('nonaktif', $invoice->fresh()->client->status);
    }
}
