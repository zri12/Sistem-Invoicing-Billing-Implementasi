<?php

namespace Tests\Feature\Api;

use App\Models\Account;
use App\Models\Client;
use App\Models\Income;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinalizationRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function fixture(): array
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $account = Account::factory()->create();
        $client = Client::factory()->create();
        $payload = [
            'invoice_name' => 'Regresi finalisasi', 'client_id' => $client->id,
            'invoice_date' => '2026-11-18', 'due_date' => '2026-12-18',
            'payment_terms' => 'Pembayaran sesuai kesepakatan', 'document_status' => 'published', 'payment_account_id' => $account->id,
            'discount' => 0, 'items' => [['description' => 'Jasa pengujian', 'price' => 11000000, 'qty' => 1]],
        ];
        $id = $this->actingAs($admin)->postJson('/api/invoices', $payload)->assertCreated()->json('data.id');
        return [$admin, $account, Invoice::findOrFail($id), $payload];
    }

    private function pay(Invoice $invoice, Account $account, int $amount): void
    {
        $this->postJson("/api/invoices/{$invoice->id}/payments", [
            'payment_date' => '2026-11-18', 'amount' => $amount,
            'method' => 'transfer', 'account_id' => $account->id,
        ])->assertCreated();
    }

    public function test_partial_payment_prevents_total_below_paid_and_preserves_items(): void
    {
        [$admin, $account, $invoice, $payload] = $this->fixture();
        $this->pay($invoice, $account, 4000000);
        $itemId = $invoice->items()->first()->id;
        $payload['items'][0]['price'] = 3000000;
        $this->putJson("/api/invoices/{$invoice->id}", $payload)->assertStatus(422)->assertJsonValidationErrors('items');
        $this->assertEquals(11000000, $invoice->fresh()->total);
        $this->assertSame($itemId, $invoice->items()->first()->id);
        $this->getJson("/api/billing/{$invoice->id}")->assertJsonPath('data.remaining', 7000000);
        $this->assertEquals(4000000, Payment::sum('amount'));
        $this->assertEquals(4000000, Income::sum('amount'));
    }

    public function test_full_payment_prevents_lower_total_and_preserves_paid_status(): void
    {
        [$admin, $account, $invoice, $payload] = $this->fixture();
        $this->pay($invoice, $account, 4000000);
        $this->pay($invoice, $account, 7000000);
        $payload['items'][0]['price'] = 8000000;
        $this->putJson("/api/invoices/{$invoice->id}", $payload)->assertStatus(422);
        $this->assertEquals(11000000, $invoice->fresh()->total);
        $this->getJson("/api/billing/{$invoice->id}")->assertJsonPath('data.status', 'paid')->assertJsonPath('data.remaining', 0);
        $this->assertSame(2, Income::count());
    }

    public function test_nonfinancial_edit_and_total_equal_paid_remain_allowed(): void
    {
        [$admin, $account, $invoice, $payload] = $this->fixture();
        $this->pay($invoice, $account, 4000000);
        $payload['invoice_notes'] = 'Catatan diperbaiki';
        $payload['items'][0]['price'] = 4000000;
        $this->putJson("/api/invoices/{$invoice->id}", $payload)->assertOk();
        $this->getJson("/api/billing/{$invoice->id}")->assertJsonPath('data.status', 'paid');
        $this->assertSame(1, Income::count());
    }

    public function test_income_failure_rolls_back_payment(): void
    {
        [$admin, $account, $invoice] = $this->fixture();
        Income::creating(function () { throw new \RuntimeException('Injected failure in isolated regression test'); });
        try {
            app(PaymentService::class)->recordPayment($invoice, [
                'payment_date' => '2026-11-18', 'amount' => 4000000,
                'method' => 'cash', 'account_id' => $account->id,
            ], $admin->id);
            $this->fail('Expected injected storage failure');
        } catch (\RuntimeException $exception) {
            $this->assertStringContainsString('Injected failure', $exception->getMessage());
        } finally {
            Income::flushEventListeners();
        }
        $this->assertSame(0, Payment::count());
        $this->assertSame(0, Income::count());
    }

    public function test_partial_payment_past_due_is_overdue(): void
    {
        [$admin, $account, $invoice] = $this->fixture();
        $this->pay($invoice, $account, 4000000);
        $invoice->update(['due_date' => now()->subDay()->toDateString()]);
        $this->getJson("/api/billing/{$invoice->id}")->assertJsonPath('data.status', 'overdue')->assertJsonPath('data.remaining', 7000000);
    }

    public function test_numbering_continues_across_year_and_month(): void
    {
        [$admin, $account, $invoice, $payload] = $this->fixture();
        $payload['invoice_date'] = '2026-12-31'; $payload['due_date'] = '2027-01-31';
        $first = $this->postJson('/api/invoices', $payload)->assertCreated()->json('data.invoice_number');
        $payload['invoice_date'] = '2027-01-01';
        $second = $this->postJson('/api/invoices', $payload)->assertCreated()->json('data.invoice_number');
        $this->assertStringEndsWith('/XII/26', $first);
        $this->assertStringEndsWith('/I/27', $second);
        $this->assertSame((int) explode('/', $first)[0] + 1, (int) explode('/', $second)[0]);
    }

    public function test_manager_rejected_edit_does_not_change_database(): void
    {
        [$admin, $account, $invoice, $payload] = $this->fixture();
        $manager = User::factory()->create(['role' => 'manager']);
        $before = $invoice->fresh()->getAttributes();
        $this->actingAs($manager)->putJson("/api/invoices/{$invoice->id}", $payload)->assertStatus(403);
        $this->assertSame($before, $invoice->fresh()->getAttributes());
        $this->assertSame(0, Payment::count());
        $this->assertSame(0, Income::count());
    }

    public function test_missing_company_files_do_not_expose_broken_asset_urls(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $company = \App\Models\Company::query()->firstOrCreate([], ['name' => 'Perusahaan Uji']);
        $company->update(['logo_path' => 'company/missing.png', 'stamp_path' => 'company/missing-stamp.png', 'signature_path' => 'company/missing-signature.png']);
        $this->actingAs($admin)->getJson('/api/company')->assertOk()
            ->assertJsonPath('data.logo_url', null)->assertJsonPath('data.stamp_url', null)->assertJsonPath('data.signature_url', null);
    }
}
