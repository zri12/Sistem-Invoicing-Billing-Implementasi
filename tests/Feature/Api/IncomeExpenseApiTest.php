<?php

namespace Tests\Feature\Api;

use App\Models\Account;
use App\Models\Income;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IncomeExpenseApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_manual_income(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/incomes', [
            'income_date' => now()->toDateString(),
            'category' => 'Pendapatan Lainnya',
            'description' => 'Sewa alat',
            'amount' => 500000,
            'account_id' => $account->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.source_type', 'manual')
            ->assertJsonPath('data.payment_id', null)
            ->assertJsonPath('data.invoice_id', null);
    }

    public function test_manual_income_endpoint_cannot_forge_invoice_source(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/incomes', [
            'income_date' => now()->toDateString(),
            'category' => 'Pendapatan Jasa',
            'description' => 'Coba forge',
            'amount' => 500000,
            'account_id' => $account->id,
            'source_type' => 'invoice',
            'payment_id' => 999,
        ]);

        $response->assertCreated()->assertJsonPath('data.source_type', 'manual');
    }

    public function test_payment_derived_income_cannot_be_edited_via_manual_endpoint(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->published()->create(['total' => 1000000]);
        $account = Account::factory()->create();
        $payment = Payment::factory()->for($invoice)->for($account)->create(['amount' => 1000000]);
        $income = Income::create([
            'income_date' => now()->toDateString(), 'source_type' => 'invoice', 'source' => 'invoice',
            'payment_id' => $payment->id, 'invoice_id' => $invoice->id, 'category' => 'Pendapatan Jasa',
            'description' => 'x', 'amount' => 1000000, 'account_id' => $account->id,
        ]);

        $this->actingAs($admin)->putJson("/api/incomes/{$income->id}", [
            'income_date' => now()->toDateString(), 'category' => 'x', 'description' => 'x',
            'amount' => 100, 'account_id' => $account->id,
        ])->assertStatus(422);
    }

    public function test_manager_cannot_create_or_update_income(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $account = Account::factory()->create();

        $this->actingAs($manager)->postJson('/api/incomes', [
            'income_date' => now()->toDateString(), 'category' => 'x', 'description' => 'x',
            'amount' => 100, 'account_id' => $account->id,
        ])->assertStatus(403);
    }

    public function test_expense_transfer_requires_destination_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson('/api/expenses', [
            'expense_date' => now()->toDateString(), 'category' => 'Operasional', 'description' => 'x',
            'amount' => 100000, 'source_account_id' => $account->id, 'transaction_type' => 'transfer',
        ])->assertStatus(422)->assertJsonValidationErrors('destination_account');
    }

    public function test_expense_non_transfer_types_are_valid_without_destination(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();

        foreach (['cash', 'qris', 'credit'] as $type) {
            $this->actingAs($admin)->postJson('/api/expenses', [
                'expense_date' => now()->toDateString(), 'category' => 'Operasional', 'description' => 'x',
                'amount' => 100000, 'source_account_id' => $account->id, 'transaction_type' => $type,
            ])->assertCreated()->assertJsonPath('data.destination_account', null);
        }
    }

    public function test_expense_transfer_with_destination_succeeds(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson('/api/expenses', [
            'expense_date' => now()->toDateString(), 'category' => 'Operasional', 'description' => 'x',
            'amount' => 100000, 'source_account_id' => $account->id, 'transaction_type' => 'transfer',
            'destination_account' => 'BCA 123456',
        ])->assertCreated()->assertJsonPath('data.destination_account', 'BCA 123456');
    }

    public function test_updating_expense_from_transfer_to_cash_clears_destination(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();
        $vendor = Vendor::factory()->create();

        $created = $this->actingAs($admin)->postJson('/api/expenses', [
            'expense_date' => now()->toDateString(), 'vendor_id' => $vendor->id, 'category' => 'Operasional',
            'description' => 'x', 'amount' => 100000, 'source_account_id' => $account->id,
            'transaction_type' => 'transfer', 'destination_account' => 'BCA 123456',
        ])->json('data');

        $this->actingAs($admin)->putJson("/api/expenses/{$created['id']}", [
            'expense_date' => now()->toDateString(), 'vendor_id' => $vendor->id, 'category' => 'Operasional',
            'description' => 'x', 'amount' => 100000, 'source_account_id' => $account->id,
            'transaction_type' => 'cash', 'destination_account' => 'stale value should be dropped',
        ])->assertOk()->assertJsonPath('data.destination_account', null);
    }

    public function test_vendor_is_optional_on_expense(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson('/api/expenses', [
            'expense_date' => now()->toDateString(), 'category' => 'Operasional', 'description' => 'x',
            'amount' => 100000, 'source_account_id' => $account->id, 'transaction_type' => 'cash',
        ])->assertCreated()->assertJsonPath('data.vendor_id', null);
    }

    public function test_manager_cannot_create_expense_but_can_read(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $account = Account::factory()->create();

        $this->actingAs($manager)->postJson('/api/expenses', [
            'expense_date' => now()->toDateString(), 'category' => 'Operasional', 'description' => 'x',
            'amount' => 100000, 'source_account_id' => $account->id, 'transaction_type' => 'cash',
        ])->assertStatus(403);

        $this->actingAs($manager)->getJson('/api/expenses')->assertOk();
    }
}
