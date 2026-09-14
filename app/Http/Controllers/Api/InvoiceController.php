<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Http\Requests\Invoice\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Services\InvoicePdfService;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    use ApiResponses;

    public function __construct(private InvoiceService $service)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);

        $invoices = Invoice::query()
            ->with(['client', 'paymentAccount'])
            ->when($request->filled('status'), fn ($q) => $q->where('document_status', $request->string('status')))
            ->when($request->filled('client_id'), fn ($q) => $q->where('client_id', $request->integer('client_id')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(fn ($sub) => $sub->where('invoice_number', 'like', $term)->orWhere('invoice_name', 'like', $term));
            })
            ->latest('invoice_date')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => InvoiceResource::collection($invoices->items()),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    public function store(StoreInvoiceRequest $request)
    {
        $invoice = $this->service->create($request->validated(), $request->user()->id);

        return $this->success(
            new InvoiceResource($invoice->load(['client', 'paymentAccount', 'items'])),
            'Invoice berhasil disimpan.',
            201
        );
    }

    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        return $this->success(new InvoiceResource($invoice->load(['client', 'paymentAccount', 'items'])));
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        $invoice = $this->service->update($invoice, $request->validated());

        return $this->success(
            new InvoiceResource($invoice->load(['client', 'paymentAccount', 'items'])),
            'Invoice berhasil diperbarui.'
        );
    }

    public function publish(Invoice $invoice)
    {
        $this->authorize('publish', $invoice);
        $invoice = $this->service->publish($invoice);

        return $this->success(new InvoiceResource($invoice), 'Invoice berhasil diterbitkan.');
    }

    public function cancel(Invoice $invoice)
    {
        $this->authorize('cancel', $invoice);
        $invoice = $this->service->cancel($invoice);

        return $this->success(new InvoiceResource($invoice), 'Invoice berhasil dibatalkan.');
    }

    public function preview(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        return $this->success(new InvoiceResource($invoice->load(['client', 'paymentAccount', 'items'])));
    }

    public function pdf(\Illuminate\Http\Request $request, Invoice $invoice, InvoicePdfService $pdfService)
    {
        $this->authorize('view', $invoice);
        // Rendering dapat memakan beberapa detik pada shared hosting. Lepaskan
        // lock session agar permintaan data/menu lain tidak ikut menunggu.
        if ($request->hasSession()) {
            $request->session()->save();
        }
        $filename = 'invoice-'.str_replace(['/', '\\'], '-', $invoice->invoice_number).'.pdf';

        try {
            $bytes = $pdfService->output($invoice);
            if ($request->boolean('warm')) {
                return response()->noContent();
            }

            return response($bytes, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Content-Length' => (string) strlen($bytes),
            ]);
        } catch (\Throwable $exception) {
            report($exception);

            try {
                // Hosting shared kadang gagal mendaftarkan font atau memproses
                // gambar tertentu. Tetap kirim template perusahaan, dengan
                // renderer yang lebih toleran; jangan kembali ke PDF Courier.
                $bytes = $pdfService->renderResilient($invoice)->output();

                return response($bytes, 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                    'Content-Length' => (string) strlen($bytes),
                ]);
            } catch (\Throwable $fallbackException) {
                report($fallbackException);

                return response()->json([
                    'success' => false,
                    'message' => 'PDF invoice gagal dibuat oleh server. Periksa log Laravel atau konfigurasi PHP hosting.',
                ], 500);
            }
        }
    }
}
