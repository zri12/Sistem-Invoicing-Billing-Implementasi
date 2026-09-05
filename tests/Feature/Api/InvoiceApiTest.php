<?php

namespace Tests\Feature\Api;

use App\Models\Account;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\ProductService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceApiTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        $client = Client::factory()->create();
        $account = Account::factory()->create();

        return array_merge([
            'invoice_name' => 'Project Spiritra',
            'client_id' => $client->id,
            'invoice_date' => '2026-08-01',
            'due_date' => '2026-08-15',
            'payment_account_id' => $account->id,
            'discount' => 0,
            'items' => [
                ['description' => 'Item A', 'price' => 1000000, 'qty' => 2],
            ],
        ], $overrides);
    }

    public function test_admin_can_create_invoice_with_single_item_and_backend_computes_totals(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/invoices', $this->payload());

        $response->assertCreated()
            ->assertJsonPath('data.subtotal', '2000000.00')
            ->assertJsonPath('data.total', '2000000.00')
            ->assertJsonPath('data.document_status', 'draft');
        $this->assertMatchesRegularExpression('#^\d{3}/INV/RKA/VIII/26$#', $response->json('data.invoice_number'));
    }

    public function test_admin_can_create_invoice_with_multiple_items(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/invoices', $this->payload([
            'items' => [
                ['description' => 'Item A', 'price' => 1000000, 'qty' => 1],
                ['description' => 'Item B', 'price' => 500000, 'qty' => 3],
            ],
        ]));

        $response->assertCreated()->assertJsonPath('data.subtotal', '2500000.00');
    }

    public function test_manipulated_subtotal_and_total_from_request_are_ignored(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/invoices', $this->payload([
            'subtotal' => 1,
            'total' => 1,
        ]));

        $response->assertCreated()->assertJsonPath('data.total', '2000000.00');
    }

    public function test_negative_discount_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/invoices', $this->payload(['discount' => -100]))
            ->assertStatus(422)->assertJsonValidationErrors('discount');
    }

    public function test_discount_exceeding_subtotal_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/invoices', $this->payload(['discount' => 9999999]))
            ->assertStatus(422)->assertJsonValidationErrors('discount');
    }

    public function test_invoice_numbers_are_unique_across_creates(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $first = $this->actingAs($admin)->postJson('/api/invoices', $this->payload())->json('data.invoice_number');
        $second = $this->actingAs($admin)->postJson('/api/invoices', $this->payload())->json('data.invoice_number');

        $this->assertNotSame($first, $second);
    }

    public function test_editing_invoice_keeps_number_and_status_unchanged(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $created = $this->actingAs($admin)->postJson('/api/invoices', $this->payload())->json('data');
        $invoice = Invoice::find($created['id']);
        $invoice->update(['document_status' => 'published']);

        $response = $this->actingAs($admin)->putJson("/api/invoices/{$invoice->id}", $this->payload([
            'client_id' => $created['client_id'],
            'payment_account_id' => $created['payment_account_id'],
            'invoice_name' => 'Renamed',
        ]));

        $response->assertOk()
            ->assertJsonPath('data.invoice_number', $created['invoice_number'])
            ->assertJsonPath('data.document_status', 'published')
            ->assertJsonPath('data.invoice_name', 'Renamed');
    }

    public function test_draft_can_be_published_and_cannot_be_published_twice(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->create(['document_status' => 'draft']);

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/publish")
            ->assertOk()->assertJsonPath('data.document_status', 'published');

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/publish")
            ->assertStatus(422);
    }

    public function test_cancel_is_rejected_when_invoice_has_payments(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->published()->create();
        Payment::factory()->for($invoice)->create();

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/cancel")->assertStatus(422);
    }

    public function test_cancel_succeeds_without_payments(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()->create(['document_status' => 'draft']);

        $this->actingAs($admin)->postJson("/api/invoices/{$invoice->id}/cancel")
            ->assertOk()->assertJsonPath('data.document_status', 'cancelled');
    }

    public function test_manager_cannot_create_update_publish_or_cancel(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $invoice = Invoice::factory()->create();

        $this->actingAs($manager)->postJson('/api/invoices', $this->payload())->assertStatus(403);
        $this->actingAs($manager)->putJson("/api/invoices/{$invoice->id}", $this->payload())->assertStatus(403);
        $this->actingAs($manager)->postJson("/api/invoices/{$invoice->id}/publish")->assertStatus(403);
        $this->actingAs($manager)->postJson("/api/invoices/{$invoice->id}/cancel")->assertStatus(403);
    }

    public function test_manager_can_read_invoices(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Invoice::factory()->count(2)->create();

        $this->actingAs($manager)->getJson('/api/invoices')->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_item_snapshots_product_name_at_time_of_invoicing(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = ProductService::factory()->create(['name' => 'Original Name']);

        $created = $this->actingAs($admin)->postJson('/api/invoices', $this->payload([
            'items' => [['product_service_id' => $product->id, 'description' => 'x', 'price' => 100, 'qty' => 1]],
        ]))->json('data');

        $product->update(['name' => 'Renamed Product']);

        $this->actingAs($admin)->getJson("/api/invoices/{$created['id']}")
            ->assertJsonPath('data.items.0.product_name', 'Original Name');
    }
}
