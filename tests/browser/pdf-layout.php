<?php

// Read-only probe: reuse isolated fixture relations, render an unsaved clone.
require __DIR__.'/database.php';
\Carbon\Carbon::setTestNow(\Carbon\Carbon::parse('2026-11-17T05:00:00Z'));
config(['filesystems.disks.public.root' => storage_path('app/public/browser-tests'),
    'invoice.pdf_storage_path' => storage_path('app/browser-test-results/pdf-layout-cache')]);
$original = \App\Models\Invoice::with(['client', 'paymentAccount', 'items'])->firstOrFail();
$invoice = $original->replicate();
$invoice->invoice_number = 'QA-LONG-LAYOUT';
$invoice->invoice_name = str_repeat('Pemeliharaan Sistem dan Dukungan ', 5);
$invoice->payment_terms = str_repeat('Syarat pembayaran bertahap. ', 20);
$invoice->subtotal = 246000; $invoice->discount = 6000; $invoice->total = 240000;
$client = $original->client->replicate();
$client->name = 'PT Maju & Jaya / '.str_repeat('Layanan Indonesia ', 8);
$invoice->setRelation('client', $client);
$invoice->setRelation('items', new \Illuminate\Database\Eloquent\Collection([
    new \App\Models\InvoiceItem(['description' => str_repeat('Maintenance / Support (Indonesia). ', 30),
        'price' => 123000, 'qty' => 2, 'total' => 246000]),
]));
$target = storage_path('app/browser-test-results/pdf/table-header-regression.pdf');
file_put_contents($target, app(\App\Services\InvoicePdfService::class)->render($invoice)->output());
echo $target;
