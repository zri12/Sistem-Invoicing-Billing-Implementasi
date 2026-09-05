<?php

namespace Tests\Feature\Api;

use App\Models\Account;
use App\Models\Expense;
use App\Models\Income;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashbook_debit_comes_from_income_and_credit_from_expense(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();
        Income::factory()->for($account)->create(['amount' => 1000000, 'income_date' => '2026-08-05']);
        Expense::factory()->create(['source_account_id' => $account->id, 'amount' => 400000, 'expense_date' => '2026-08-06']);

        $response = $this->actingAs($admin)->getJson('/api/reports/cashbook?from=2026-08-01&to=2026-08-31');

        $response->assertOk()
            ->assertJsonPath('data.debit', 1000000)
            ->assertJsonPath('data.credit', 400000)
            ->assertJsonPath('data.balance', 600000);
    }

    public function test_cashbook_expense_uses_source_account_not_destination(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $sourceAccount = Account::factory()->create();
        $otherAccount = Account::factory()->create();
        Expense::factory()->transfer()->create([
            'source_account_id' => $sourceAccount->id,
            'amount' => 200000,
        ]);

        $filteredBySource = $this->actingAs($admin)
            ->getJson("/api/reports/cashbook?account_id={$sourceAccount->id}")
            ->json('data.credit');
        $filteredByOther = $this->actingAs($admin)
            ->getJson("/api/reports/cashbook?account_id={$otherAccount->id}")
            ->json('data.credit');

        $this->assertSame(200000, $filteredBySource);
        $this->assertSame(0, $filteredByOther);
    }

    public function test_date_range_filter_excludes_out_of_range_entries(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();
        Income::factory()->for($account)->create(['amount' => 500000, 'income_date' => '2026-01-01']);

        $response = $this->actingAs($admin)->getJson('/api/reports/cashbook?from=2026-08-01&to=2026-08-31');

        $response->assertJsonPath('data.debit', 0);
    }

    public function test_manager_can_read_all_report_endpoints(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        foreach (['cashbook', 'invoices', 'payments', 'incomes', 'expenses'] as $report) {
            $this->actingAs($manager)->getJson("/api/reports/{$report}")->assertOk();
        }
    }
}
