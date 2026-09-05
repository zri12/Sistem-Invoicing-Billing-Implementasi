<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Services\BillingService;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    use ApiResponses;

    public function __construct(private BillingService $billing)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);

        $invoices = Invoice::query()
            ->where('document_status', 'published')
            ->with(['client', 'paymentAccount', 'payments'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(fn ($sub) => $sub->where('invoice_number', 'like', $term)->orWhere('invoice_name', 'like', $term));
            })
            ->get();

        $rows = $invoices->map(fn (Invoice $invoice) => [
            'invoice' => new InvoiceResource($invoice),
            ...$this->billing->summarize($invoice),
        ]);

        if ($request->filled('status')) {
            $rows = $rows->where('status', $request->string('status')->toString())->values();
        }

        $page = max(1, $request->integer('page', 1));
        $perPage = $request->integer('per_page', 15);

        return $this->success([
            'items' => $rows->forPage($page, $perPage)->values(),
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $rows->count(),
            ],
        ]);
    }

    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice);
        $invoice->load(['client', 'paymentAccount', 'payments.account']);

        return $this->success([
            'invoice' => new InvoiceResource($invoice),
            ...$this->billing->summarize($invoice),
        ]);
    }
}
