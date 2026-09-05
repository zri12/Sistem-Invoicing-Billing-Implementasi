<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponses;

    public function __construct(private PaymentService $service)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        $payments = Payment::query()
            ->with(['account', 'invoice'])
            ->when($request->filled('invoice_id'), fn ($q) => $q->where('invoice_id', $request->integer('invoice_id')))
            ->when($request->filled('account_id'), fn ($q) => $q->where('account_id', $request->integer('account_id')))
            ->when($request->filled('method'), fn ($q) => $q->where('method', $request->string('method')))
            ->latest('payment_date')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => PaymentResource::collection($payments->items()),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function storeForInvoice(StorePaymentRequest $request, Invoice $invoice)
    {
        $payment = $this->service->recordPayment($invoice, $request->validated(), $request->user()->id);

        return $this->success(new PaymentResource($payment->load('account')), 'Pembayaran berhasil dicatat.', 201);
    }

    public function indexForInvoice(Invoice $invoice)
    {
        $this->authorize('viewAny', Payment::class);
        $payments = $invoice->payments()->with('account')->latest('payment_date')->get();

        return $this->success(PaymentResource::collection($payments));
    }
}
