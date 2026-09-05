<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceTemplateSetting;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoicePdfService
{
    public function render(Invoice $invoice)
    {
        $invoice->loadMissing(['client', 'paymentAccount', 'items']);

        $company = Company::query()->first() ?? Company::create(['name' => 'PT. Ruang Kreasi Aplikasi']);
        $template = InvoiceTemplateSetting::query()->first() ?? InvoiceTemplateSetting::create([]);

        $logoPath = $company->logo_path ? storage_path('app/public/'.$company->logo_path) : null;
        $logoPath = $logoPath && file_exists($logoPath) ? $logoPath : null;
        $stampPath = $company->stamp_path ? storage_path('app/public/'.$company->stamp_path) : null;
        $stampPath = $stampPath && file_exists($stampPath) ? $stampPath : null;
        $signaturePath = $company->signature_path ? storage_path('app/public/'.$company->signature_path) : null;

        return Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
            'template' => $template,
            'logoPath' => $logoPath,
            // Same fallback as the on-screen invoice preview: no dedicated stamp
            // upload falls back to the company logo.
            'stampPath' => $stampPath ?: $logoPath,
            'signaturePath' => $signaturePath && file_exists($signaturePath) ? $signaturePath : null,
        ])->setPaper('a4', 'portrait');
    }
}
