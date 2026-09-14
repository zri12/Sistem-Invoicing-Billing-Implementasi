<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\InvoicePdfService;
use Illuminate\Http\Request;

class InvoicePrintController extends Controller
{
    public function show(Request $request, Invoice $invoice, InvoicePdfService $pdfService)
    {
        $this->authorize('view', $invoice);
        if ($request->hasSession()) {
            $request->session()->save();
        }
        $filename = 'invoice-'.str_replace(['/', '\\'], '-', $invoice->invoice_number).'.pdf';
        $bytes = $pdfService->output($invoice);

        return response($bytes, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Content-Length' => (string) strlen($bytes),
        ]);
    }
}
