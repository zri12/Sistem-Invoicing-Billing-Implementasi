<?php

namespace Tests\Feature\Api;

use App\Models\Expense;
use App\Models\Income;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecentActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_activity_requires_authentication(): void
    {
        $this->getJson('/api/recent-activity')->assertUnauthorized();
    }

    public function test_admin_and_manager_see_transaction_activity_without_duplicate_payment_income(): void
    {
        $payment = Payment::factory()->create();
        Income::factory()->create(['source_type' => 'invoice', 'payment_id' => $payment->id, 'invoice_id' => $payment->invoice_id]);
        $income = Income::factory()->create(['description' => 'Pemasukan uji']);
        $expense = Expense::factory()->create(['description' => 'Pengeluaran uji']);

        foreach (['admin', 'manager'] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $response = $this->actingAs($user)->getJson('/api/recent-activity')->assertOk()->assertJsonCount(3, 'data');
            $ids = collect($response->json('data'))->pluck('id')->all();
            $this->assertContains('payment-'.$payment->id, $ids);
            $this->assertContains('income-'.$income->id, $ids);
            $this->assertContains('expense-'.$expense->id, $ids);
        }
    }

    public function test_activity_is_limited_to_ten_recent_entries(): void
    {
        Income::factory()->count(12)->create();
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->getJson('/api/recent-activity')->assertOk()->assertJsonCount(10, 'data');
    }
}

