<?php

namespace Tests\Feature\Api;

use App\Models\Account;
use App\Models\Income;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingPaymentApiTest extends TestCase
{
    use RefreshDatabase;

    private function publishedInvoice(array $overrides = []): Invoice
    {
        return Invoice::factory()->create(array_merge([
            'document_status' => 'published',
            'subtotal' => 5000000,
            'discount' => 0,
            'total' => 5000000,
        ], $overrides));
    }

    public function test_partial_payment_updates_remaining_and_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->publishedInvoice();
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(),
            'amount' => 2000000,
            'method' => 'transfer',
            'account_id' => $account->id,
        ])->assertCreated();

        $this->actingAs($admin)->getJson("/api/billing/{$invoice->id}")
            ->assertOk()
            ->assertJsonPath('data.total_paid', 2000000)
            ->assertJsonPath('data.remaining', 3000000)
            ->assertJsonPath('data.status', 'partial');
    }

    public function test_overpayment_is_rejected_and_creates_no_payment_or_income(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->publishedInvoice(['total' => 3000000]);
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(),
            'amount' => 4000000,
            'method' => 'transfer',
            'account_id' => $account->id,
        ])->assertStatus(422);

        $this->assertSame(0, $invoice->payments()->count());
        $this->assertSame(0, Income::count());
    }

    public function test_full_payment_marks_invoice_paid(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->publishedInvoice(['total' => 3000000]);
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(),
            'amount' => 3000000,
            'method' => 'cash',
            'account_id' => $account->id,
        ])->assertCreated();

        $this->actingAs($admin)->getJson("/api/billing/{$invoice->id}")
            ->assertJsonPath('data.remaining', 0)
            ->assertJsonPath('data.status', 'paid');
    }

    public function test_fully_paid_invoice_rejects_further_payment(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->publishedInvoice(['total' => 1000000]);
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(), 'amount' => 1000000, 'method' => 'cash', 'account_id' => $account->id,
        ])->assertCreated();

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(), 'amount' => 1, 'method' => 'cash', 'account_id' => $account->id,
        ])->assertStatus(422);
    }

    public function test_payment_rejected_for_draft_invoice(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->create(['document_status' => 'draft', 'total' => 1000000]);
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(), 'amount' => 500000, 'method' => 'cash', 'account_id' => $account->id,
        ])->assertStatus(422);
    }

    public function test_payment_creates_exactly_one_linked_income(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->publishedInvoice(['total' => 1000000]);
        $account = Account::factory()->create();

        $paymentId = $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(), 'amount' => 1000000, 'method' => 'cash', 'account_id' => $account->id,
        ])->json('data.id');

        $this->assertSame(1, Income::where('payment_id', $paymentId)->count());
        $this->assertSame('invoice', Income::where('payment_id', $paymentId)->first()->source_type);
    }

    public function test_publishing_invoice_alone_creates_no_income(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->create(['document_status' => 'draft']);

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/publish")->assertOk();

        $this->assertSame(0, Income::count());
    }

    public function test_due_today_is_not_overdue_but_due_yesterday_is(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $dueToday = $this->publishedInvoice(['due_date' => now()->toDateString()]);
        $dueYesterday = $this->publishedInvoice(['due_date' => now()->subDay()->toDateString()]);

        $this->actingAs($admin)->getJson("/api/billing/{$dueToday->id}")->assertJsonPath('data.status', 'unpaid');
        $this->actingAs($admin)->getJson("/api/billing/{$dueYesterday->id}")->assertJsonPath('data.status', 'overdue');
    }

    public function test_paid_status_takes_priority_over_overdue(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = $this->publishedInvoice(['due_date' => now()->subDay()->toDateString(), 'total' => 1000000]);
        $account = Account::factory()->create();

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(), 'amount' => 1000000, 'method' => 'cash', 'account_id' => $account->id,
        ])->assertCreated();

        $this->actingAs($admin)->getJson("/api/billing/{$invoice->id}")->assertJsonPath('data.status', 'paid');
    }

    public function test_draft_invoices_are_excluded_from_billing_list(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Invoice::factory()->create(['document_status' => 'draft']);
        Invoice::factory()->create(['document_status' => 'cancelled']);
        $this->publishedInvoice();

        $this->actingAs($admin)->getJson('/api/billing')->assertOk()->assertJsonCount(1, 'data.items');
    }

    public function test_manager_cannot_record_payment_but_can_read_billing(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $invoice = $this->publishedInvoice();
        $account = Account::factory()->create();

        $this->actingAs($manager)->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => now()->toDateString(), 'amount' => 1000, 'method' => 'cash', 'account_id' => $account->id,
        ])->assertStatus(403);

        $this->actingAs($manager)->getJson('/api/billing')->assertOk();
        $this->actingAs($manager)->getJson('/api/payments')->assertOk();
    }
}
