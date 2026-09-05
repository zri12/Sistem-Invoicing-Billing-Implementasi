<?php

namespace Tests\Feature\Api;

use App\Models\Account;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoicePdfApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_download_invoice_pdf(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()
            ->for(Client::factory())
            ->for(Account::factory(), 'paymentAccount')
            ->create();
        InvoiceItem::factory()->for($invoice)->create();

        $response = $this->actingAs($admin)->get("/api/invoices/{$invoice->id}/pdf");

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_manager_can_also_download_invoice_pdf(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $invoice = Invoice::factory()
            ->for(Client::factory())
            ->for(Account::factory(), 'paymentAccount')
            ->create();
        InvoiceItem::factory()->for($invoice)->create();

        $this->actingAs($manager)->get("/api/invoices/{$invoice->id}/pdf")->assertOk();
    }
}
