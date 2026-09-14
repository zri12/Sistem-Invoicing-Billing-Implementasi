<?php

namespace Tests\Feature\Api;

use App\Models\Account;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use App\Services\InvoicePdfService;
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
        $this->assertStringContainsString('TamilSangamMNPDF-Regular', $response->getContent());
        $this->assertStringNotContainsString('/BaseFont /Courier', $response->getContent());
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

    public function test_pdf_can_be_warmed_without_sending_the_file(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()
            ->for(Client::factory())
            ->for(Account::factory(), 'paymentAccount')
            ->create();
        InvoiceItem::factory()->for($invoice)->create();

        $this->actingAs($admin)
            ->get("/api/invoices/{$invoice->id}/pdf?warm=1")
            ->assertNoContent();
    }

    public function test_print_and_download_use_the_same_pdf(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $invoice = Invoice::factory()
            ->for(Client::factory())
            ->for(Account::factory(), 'paymentAccount')
            ->create();
        InvoiceItem::factory()->for($invoice)->create();

        $download = $this->actingAs($admin)->get("/api/invoices/{$invoice->id}/pdf");
        $print = $this->actingAs($admin)->get("/invoice/{$invoice->id}/print");

        $download->assertOk();
        $print->assertOk();
        $this->assertStringStartsWith('attachment;', $download->headers->get('Content-Disposition'));
        $this->assertStringStartsWith('inline;', $print->headers->get('Content-Disposition'));
        $this->assertSame($download->getContent(), $print->getContent());
    }

    public function test_resilient_renderer_never_generates_the_plain_courier_pdf(): void
    {
        $invoice = Invoice::factory()
            ->for(Client::factory())
            ->for(Account::factory(), 'paymentAccount')
            ->create();
        InvoiceItem::factory()->for($invoice)->create();

        $pdf = app(InvoicePdfService::class)->renderResilient($invoice)->output();

        $this->assertStringStartsWith('%PDF-', $pdf);
        $this->assertStringNotContainsString('/BaseFont /Courier', $pdf);
    }
}
