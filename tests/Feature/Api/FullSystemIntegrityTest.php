<?php

namespace Tests\Feature\Api;

use App\Models\{Account, Client, Expense, Income, Invoice, InvoiceItem, ProductService, User, Vendor};
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class FullSystemIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user);
        return $user;
    }

    private function invoicePayload(): array
    {
        return ['invoice_name' => "E2E-INVOICE-O'Connor & Jaya / Support", 'client_id' => Client::factory()->create()->id,
            'invoice_date' => '2026-11-17', 'due_date' => '2026-12-01',
            'payment_account_id' => Account::factory()->create()->id, 'discount' => 0,
            'items' => [['description' => 'Maintenance / Support (Indonesia)', 'price' => 10000000, 'qty' => 1]]];
    }

    public static function masters(): array
    {
        return [['clients', ['name' => 'E2E-CLIENT', 'email' => 'client@example.test']],
            ['vendors', ['name' => 'E2E-VENDOR']],
            ['products-services', ['name' => 'E2E-PRODUCT', 'default_price' => 1000]],
            ['accounts', ['name' => 'E2E-ACCOUNT', 'branch' => 'Bandung']]];
    }

    #[DataProvider('masters')]
    public function test_master_status_selection_is_persisted_on_create_and_edit(string $path, array $payload): void
    {
        $this->admin();
        $record = $this->postJson('/api/'.$path, [...$payload, 'status' => 'nonaktif'])
            ->assertCreated()->assertJsonPath('data.status', 'nonaktif')->json('data');
        $this->putJson('/api/'.$path.'/'.$record['id'], [...$payload, 'status' => 'aktif'])
            ->assertOk()->assertJsonPath('data.status', 'aktif');
        $this->getJson('/api/'.$path.'/'.$record['id'])->assertOk()->assertJsonPath('data.status', 'aktif');
    }

    public function test_invoice_edit_cannot_reduce_total_below_recorded_payments(): void
    {
        $admin = $this->admin();
        $payload = $this->invoicePayload();
        $invoice = $this->postJson('/api/invoices', [...$payload, 'document_status' => 'published'])->json('data');
        $this->postJson('/api/invoices/'.$invoice['id'].'/payments', [
            'payment_date' => '2026-11-17', 'amount' => 8000000, 'method' => 'cash', 'account_id' => $payload['payment_account_id'],
        ])->assertCreated();
        $payload['items'][0]['price'] = 1000000;
        $this->putJson('/api/invoices/'.$invoice['id'], $payload)->assertUnprocessable();
        $this->assertDatabaseHas('invoices', ['id' => $invoice['id'], 'total' => 10000000]);
        $this->assertDatabaseCount('payments', 1);
        $this->assertDatabaseCount('incomes', 1);
    }

    public function test_product_snapshot_survives_unrelated_invoice_edit_after_master_rename(): void
    {
        $this->admin();
        $product = ProductService::factory()->create(['name' => 'Original service']);
        $payload = $this->invoicePayload();
        $payload['items'][0]['product_service_id'] = $product->id;
        $invoice = $this->postJson('/api/invoices', $payload)->assertCreated()->json('data');
        $product->update(['name' => 'New name', 'default_price' => 999]);
        $payload['invoice_name'] = 'Edited header';
        $this->putJson('/api/invoices/'.$invoice['id'], $payload)->assertOk()
            ->assertJsonPath('data.items.0.product_name', 'Original service')
            ->assertJsonPath('data.invoice_number', $invoice['invoice_number']);
    }

    public function test_payment_sequence_and_rejected_operations_preserve_ledger(): void
    {
        $this->admin();
        $payload = $this->invoicePayload();
        $invoice = $this->postJson('/api/invoices', [...$payload, 'document_status' => 'published'])->assertCreated()->json('data');
        $url = '/api/invoices/'.$invoice['id'].'/payments';
        $payment = ['payment_date' => '2026-11-17', 'method' => 'transfer', 'account_id' => $payload['payment_account_id']];
        foreach ([3000000, 2000000] as $amount) $this->postJson($url, [...$payment, 'amount' => $amount])->assertCreated();
        $this->postJson($url, [...$payment, 'amount' => 6000000])->assertUnprocessable();
        $this->assertDatabaseCount('payments', 2);
        $this->assertDatabaseCount('incomes', 2);
        $this->getJson('/api/billing/'.$invoice['id'])->assertJsonPath('data.remaining', 5000000);
        $this->postJson('/api/invoices/'.$invoice['id'].'/cancel')->assertUnprocessable();
        $this->postJson($url, [...$payment, 'amount' => 5000000])->assertCreated();
        $this->postJson($url, [...$payment, 'amount' => 1])->assertUnprocessable();
        $this->getJson('/api/billing/'.$invoice['id'])->assertJsonPath('data.remaining', 0)->assertJsonPath('data.status', 'paid');
        foreach (\App\Models\Payment::with('income')->get() as $p) {
            $this->assertNotNull($p->income);
            foreach (['amount', 'account_id', 'invoice_id'] as $field) $this->assertEquals($p->$field, $p->income->$field);
            $this->assertEquals($p->payment_date, $p->income->income_date);
        }
        $this->assertDatabaseCount('incomes', 3);
    }

    public function test_income_failure_rolls_back_payment(): void
    {
        $admin = $this->admin();
        $invoice = Invoice::factory()->published()->create(['total' => 1000000]);
        Income::creating(function () { throw new \RuntimeException('Deliberate income failure'); });
        try {
            app(PaymentService::class)->recordPayment($invoice, ['payment_date' => '2026-11-17', 'amount' => 800000,
                'method' => 'cash', 'account_id' => $invoice->payment_account_id], $admin->id);
            $this->fail('Expected the deliberately injected persistence failure');
        } catch (\RuntimeException $e) {
            $this->assertSame('Deliberate income failure', $e->getMessage());
        } finally { Income::flushEventListeners(); }
        $this->assertDatabaseCount('payments', 0);
        $this->assertDatabaseCount('incomes', 0);
    }

    public function test_fractional_currency_payments_do_not_reject_exact_remaining_due_to_float_error(): void
    {
        $this->admin(); $payload = $this->invoicePayload();
        $payload['items'] = [['description' => 'A', 'price' => 0.1, 'qty' => 1], ['description' => 'B', 'price' => 0.2, 'qty' => 1]];
        $invoice = $this->postJson('/api/invoices', [...$payload, 'document_status' => 'published'])->assertCreated()->json('data');
        foreach ([0.1, 0.2] as $amount) $this->postJson('/api/invoices/'.$invoice['id'].'/payments', [
            'payment_date' => '2026-11-17', 'amount' => $amount, 'method' => 'cash', 'account_id' => $payload['payment_account_id'],
        ])->assertCreated();
        $this->getJson('/api/billing/'.$invoice['id'])->assertJsonPath('data.remaining', 0)->assertJsonPath('data.status', 'paid');
    }

    public function test_admin_cannot_disable_self_via_update_status_field(): void
    {
        $admin = $this->admin();
        $this->putJson('/api/users/'.$admin->id, ['name' => $admin->name, 'username' => $admin->username,
            'role' => 'admin', 'status' => 'nonaktif'])->assertUnprocessable();
        $this->assertDatabaseHas('users', ['id' => $admin->id, 'status' => 'aktif']);
    }

    public static function invalidInvoices(): array
    {
        return [['client_id', null], ['payment_account_id', null], ['due_date', null], ['items', []],
            ['items.0.qty', 0], ['items.0.qty', -1], ['items.0.price', 0], ['discount', -1], ['discount', 10000001]];
    }

    #[DataProvider('invalidInvoices')]
    public function test_invoice_invalid_input_does_not_write(string $field, mixed $value): void
    {
        $this->admin(); $payload = $this->invoicePayload(); data_set($payload, $field, $value);
        $this->postJson('/api/invoices', $payload)->assertUnprocessable()->assertJsonPath('success', false)->assertJsonStructure(['errors']);
        $this->assertDatabaseCount('invoices', 0); $this->assertDatabaseCount('invoice_items', 0);
    }

    public function test_all_manager_writes_are_denied_and_all_guest_reads_are_unauthorized(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $client = Client::factory()->create(); $vendor = Vendor::factory()->create();
        $product = ProductService::factory()->create(); $account = Account::factory()->create();
        $invoice = Invoice::factory()->published()->create(); $income = Income::factory()->create(['source_type' => 'manual']);
        $expense = Expense::factory()->create();
        $writes = [];
        foreach (['clients' => $client, 'vendors' => $vendor, 'products-services' => $product, 'accounts' => $account] as $path => $record) {
            $writes = [...$writes, ['POST', $path], ['PUT', "$path/{$record->id}"], ['PATCH', "$path/{$record->id}/status"]];
        }
        $writes = [...$writes, ['POST', 'invoices'], ['PUT', "invoices/{$invoice->id}"], ['POST', "invoices/{$invoice->id}/publish"],
            ['POST', "invoices/{$invoice->id}/cancel"], ['POST', "invoices/{$invoice->id}/payments"], ['POST', 'incomes'],
            ['PUT', "incomes/{$income->id}"], ['POST', 'expenses'], ['PUT', "expenses/{$expense->id}"], ['PUT', 'company'],
            ['PUT', 'settings/invoice-template'], ['PUT', 'settings/invoice-numbering'], ['GET', 'users'], ['POST', 'users'],
            ['PUT', "users/{$manager->id}"], ['PATCH', "users/{$manager->id}/status"]];
        foreach ($writes as [$method, $path]) $this->actingAs($manager)->json($method, '/api/'.$path, [])->assertForbidden();
        auth()->forgetGuards();
        foreach (['me', 'clients', 'vendors', 'products-services', 'accounts', 'invoices', 'billing', 'payments', 'incomes', 'expenses',
            'company', 'settings/invoice-template', 'settings/invoice-numbering', 'users', 'reports/cashbook', 'reports/invoices',
            'reports/payments', 'reports/incomes', 'reports/expenses'] as $path) {
            $this->getJson('/api/'.$path)->assertUnauthorized()->assertJsonPath('success', false);
        }
    }

    public function test_company_rejects_invalid_and_oversized_uploads_without_replacing_old_file(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public'); $this->admin();
        $company = \App\Models\Company::factory()->create(['logo_path' => 'company/original.png']);
        \Illuminate\Support\Facades\Storage::disk('public')->put('company/original.png', 'original');
        foreach ([\Illuminate\Http\UploadedFile::fake()->create('bad.txt', 1, 'text/plain'),
            \Illuminate\Http\UploadedFile::fake()->image('huge.png')->size(2049)] as $file) {
            $this->postJson('/api/company', ['_method' => 'PUT', 'name' => 'QA Company', 'logo' => $file])
                ->assertUnprocessable()->assertJsonValidationErrors('logo');
            $this->assertDatabaseHas('companies', ['id' => $company->id, 'logo_path' => 'company/original.png']);
            \Illuminate\Support\Facades\Storage::disk('public')->assertExists('company/original.png');
        }
    }

    public function test_numbering_formats_new_invoices_without_mutating_existing_numbers(): void
    {
        $this->admin(); $payload = $this->invoicePayload();
        $old = $this->postJson('/api/invoices', $payload)->assertCreated()->json('data');
        $this->putJson('/api/settings/invoice-numbering', [
            'document_code' => 'QA', 'company_code' => 'TEST', 'digits' => 5,
            'month_format' => 'angka', 'year_format' => '4digit', 'reset_rule' => 'continuous',
        ])->assertOk();
        $new = $this->postJson('/api/invoices', $payload)->assertCreated()->json('data');
        $this->assertSame('00002/QA/TEST/11/2026', $new['invoice_number']);
        $this->getJson('/api/invoices/'.$old['id'])->assertJsonPath('data.invoice_number', $old['invoice_number']);
    }

    public function test_report_date_boundaries_include_transactions_on_both_endpoints(): void
    {
        $this->admin(); $account = Account::factory()->create();
        Income::factory()->create(['income_date' => '2026-11-17', 'amount' => 100, 'account_id' => $account->id]);
        Expense::factory()->create(['expense_date' => '2026-11-17', 'amount' => 50, 'source_account_id' => $account->id]);
        $this->getJson('/api/reports/cashbook?from=2026-11-17&to=2026-11-17')
            ->assertOk()->assertJsonPath('data.debit', 100)->assertJsonPath('data.credit', 50);
    }

    public function test_login_bootstrap_does_not_silently_truncate_financial_or_master_lists(): void
    {
        User::factory()->create(['username' => 'qa-bootstrap', 'password' => bcrypt('password123'), 'status' => 'aktif']);
        $account = Account::factory()->create();
        Client::factory()->count(105)->create();
        Income::factory()->count(205)->create(['account_id' => $account->id, 'source_type' => 'manual']);
        $this->postJson('/api/login', ['username' => 'qa-bootstrap', 'password' => 'password123'])
            ->assertOk()->assertJsonCount(105, 'data.bootstrap.clients')->assertJsonCount(205, 'data.bootstrap.incomes');
    }

    public function test_inactive_master_records_are_rejected_for_new_transactions_but_history_remains_readable(): void
    {
        $this->admin(); $payload = $this->invoicePayload();
        $product = ProductService::factory()->create(); $payload['items'][0]['product_service_id'] = $product->id;
        $invoice = $this->postJson('/api/invoices', [...$payload, 'document_status' => 'published'])->assertCreated()->json('data');
        Client::find($payload['client_id'])->update(['status' => 'nonaktif']);
        $this->postJson('/api/invoices', $payload)->assertUnprocessable();
        Client::find($payload['client_id'])->update(['status' => 'aktif']);
        $product->update(['status' => 'nonaktif']);
        $this->postJson('/api/invoices', $payload)->assertUnprocessable();
        $product->update(['status' => 'aktif']);
        Account::find($payload['payment_account_id'])->update(['status' => 'nonaktif']);
        $this->postJson('/api/invoices', $payload)->assertUnprocessable();
        $this->postJson('/api/invoices/'.$invoice['id'].'/payments', [
            'payment_date' => '2026-11-17', 'amount' => 1, 'method' => 'cash', 'account_id' => $payload['payment_account_id'],
        ])->assertUnprocessable();
        $this->getJson('/api/invoices/'.$invoice['id'])->assertOk();
        $this->putJson('/api/invoices/'.$invoice['id'], $payload)->assertOk();
    }

    public function test_fully_discounted_invoice_is_settled_without_creating_income(): void
    {
        $this->admin(); $payload = $this->invoicePayload();
        $invoice = $this->postJson('/api/invoices', [...$payload, 'discount' => 10000000, 'document_status' => 'published'])->assertCreated()->json('data');
        $this->getJson('/api/billing/'.$invoice['id'])->assertOk()->assertJsonPath('data.status', 'paid')->assertJsonPath('data.remaining', 0);
        $this->assertDatabaseCount('incomes', 0); $this->assertDatabaseCount('payments', 0);
    }

    public function test_overdue_date_uses_the_same_jakarta_business_day_as_the_browser(): void
    {
        $this->admin();
        \Carbon\Carbon::setTestNow(\Carbon\Carbon::parse('2026-11-17T18:00:00Z'));
        try {
            $invoice = Invoice::factory()->published()->create(['invoice_date' => '2026-11-16', 'due_date' => '2026-11-17', 'total' => 100]);
            // 18:00 UTC is already 01:00 on 18 November in Jakarta.
            $this->getJson('/api/billing/'.$invoice->id)->assertOk()->assertJsonPath('data.status', 'overdue');
        } finally { \Carbon\Carbon::setTestNow(); }
    }

    public function test_master_updates_and_status_responses_preserve_history_counts(): void
    {
        $this->admin(); $invoice = Invoice::factory()->create();
        $expense = Expense::factory()->create(['vendor_id' => Vendor::factory()->create()->id]);
        $this->putJson('/api/clients/'.$invoice->client_id, ['name' => 'Updated client'])->assertOk()->assertJsonPath('data.invoice_count', 1);
        $this->patchJson('/api/clients/'.$invoice->client_id.'/status')->assertOk()->assertJsonPath('data.invoice_count', 1);
        $this->putJson('/api/vendors/'.$expense->vendor_id, ['name' => 'Updated vendor'])->assertOk()->assertJsonPath('data.expense_count', 1);
        $this->patchJson('/api/vendors/'.$expense->vendor_id.'/status')->assertOk()->assertJsonPath('data.expense_count', 1);
    }

    public function test_foreign_key_types_are_consistent_for_form_strings_and_reloaded_resources(): void
    {
        $this->admin(); $payload = $this->invoicePayload();
        $payload['client_id'] = (string) $payload['client_id'];
        $payload['payment_account_id'] = (string) $payload['payment_account_id'];
        $created = $this->postJson('/api/invoices', $payload)->assertCreated()->json('data');
        $this->assertIsInt($created['client_id']); $this->assertIsInt($created['payment_account_id']);
        $reloaded = $this->getJson('/api/invoices/'.$created['id'])->assertOk()->json('data');
        $this->assertSame($created['client_id'], $reloaded['client_id']);
    }

    public function test_all_template_flags_persist_and_total_toggle_hides_every_total_due_label(): void
    {
        $this->admin(); $template = \App\Models\InvoiceTemplateSetting::factory()->create();
        $flags = collect($template->getCasts())->filter(fn ($cast, $field) => $cast === 'boolean' && str_starts_with($field, 'show_'))->keys();
        foreach ($flags as $flag) {
            $this->putJson('/api/settings/invoice-template', ['title' => 'QA', $flag => false])->assertOk()->assertJsonPath('data.'.$flag, false);
            $this->getJson('/api/settings/invoice-template')->assertOk()->assertJsonPath('data.'.$flag, false);
            $template->update([$flag => true]);
        }
        $template->update(['show_total' => false]);
        $invoice = Invoice::factory()->create(); InvoiceItem::factory()->for($invoice)->create();
        $html = app(\App\Services\InvoicePdfService::class)->render($invoice)->getDomPDF()->output();
        $this->assertStringStartsWith('%PDF-', $html);
        // Inspect the source view as HTML: compressed PDF text is not a visibility assertion.
        $html = view('pdf.invoice', ['invoice' => $invoice->load(['client', 'paymentAccount', 'items']),
            'company' => \App\Models\Company::first(), 'template' => $template->fresh(),
            'logoPath' => null, 'stampPath' => null, 'signaturePath' => null, 'signatureFramePath' => null])->render();
        $this->assertStringNotContainsString('Total Due:', $html);
    }
}
