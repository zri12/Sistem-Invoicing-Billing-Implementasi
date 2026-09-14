<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\ProductService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InvoiceService
{
    public function __construct(private InvoiceNumberService $numberService)
    {
    }

    public function create(array $data, ?int $userId): Invoice
    {
        return DB::transaction(function () use ($data, $userId) {
            $items = $this->buildItems($data['items']);
            $subtotal = array_sum(array_column($items, 'total'));
            $discount = (float) ($data['discount'] ?? 0);
            $this->validateDiscount($discount, $subtotal);

            $invoice = Invoice::create([
                'invoice_number' => $this->numberService->generate(Carbon::parse($data['invoice_date'])),
                'invoice_name' => $data['invoice_name'],
                'client_id' => $data['client_id'],
                'invoice_date' => $data['invoice_date'],
                'due_date' => $data['due_date'],
                'document_status' => $data['document_status'] ?? 'draft',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
                'payment_account_id' => $data['payment_account_id'],
                'payment_terms' => $data['payment_terms'] ?? null,
                'invoice_notes' => $data['invoice_notes'] ?? null,
                'created_by' => $userId,
            ]);

            $invoice->items()->createMany($items);

            return $invoice->load('items');
        });
    }

    public function update(Invoice $invoice, array $data): Invoice
    {
        return DB::transaction(function () use ($invoice, $data) {
            if ($invoice->document_status === 'cancelled') {
                throw ValidationException::withMessages([
                    'document_status' => ['Invoice yang sudah dibatalkan tidak dapat diedit.'],
                ]);
            }

            $items = $this->buildItems($data['items']);
            $subtotal = array_sum(array_column($items, 'total'));
            $discount = (float) ($data['discount'] ?? 0);
            $this->validateDiscount($discount, $subtotal);

            // invoice_number and document_status are intentionally never
            // touched here - number is immutable after creation, and status
            // only changes via the dedicated publish/cancel endpoints.
            $invoice->update([
                'invoice_name' => $data['invoice_name'],
                'client_id' => $data['client_id'],
                'invoice_date' => $data['invoice_date'],
                'due_date' => $data['due_date'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
                'payment_account_id' => $data['payment_account_id'],
                'payment_terms' => $data['payment_terms'] ?? null,
                'invoice_notes' => $data['invoice_notes'] ?? null,
            ]);

            $invoice->items()->delete();
            $invoice->items()->createMany($items);

            return $invoice->load('items');
        });
    }

    public function publish(Invoice $invoice): Invoice
    {
        if ($invoice->document_status !== 'draft') {
            throw ValidationException::withMessages([
                'document_status' => ['Hanya invoice berstatus draft yang dapat diterbitkan.'],
            ]);
        }

        // Publishing does not create an Income record.
        $invoice->update(['document_status' => 'published']);

        return $invoice;
    }

    public function cancel(Invoice $invoice): Invoice
    {
        if ($invoice->document_status === 'cancelled') {
            throw ValidationException::withMessages([
                'document_status' => ['Invoice sudah dibatalkan.'],
            ]);
        }

        // A paid invoice cannot be cancelled because refund/reversal behavior
        // is not implemented. Reject the action instead of inventing a ledger
        // reversal silently.
        if ($invoice->payments()->exists()) {
            throw ValidationException::withMessages([
                'document_status' => ['Invoice dengan pembayaran tercatat tidak dapat dibatalkan otomatis. Diperlukan keputusan bisnis.'],
            ]);
        }

        $invoice->update(['document_status' => 'cancelled']);

        return $invoice;
    }

    private function buildItems(array $items): array
    {
        return array_map(function (array $item) {
            $price = (float) $item['price'];
            $qty = (float) $item['qty'];
            $productName = null;

            if (! empty($item['product_service_id'])) {
                $productName = ProductService::find($item['product_service_id'])?->name;
            }

            return [
                'product_service_id' => $item['product_service_id'] ?? null,
                'product_name' => $productName,
                'description' => $item['description'],
                'qty' => $qty,
                'price' => $price,
                'total' => $price * $qty,
            ];
        }, $items);
    }

    private function validateDiscount(float $discount, float $subtotal): void
    {
        if ($discount < 0) {
            throw ValidationException::withMessages([
                'discount' => ['Diskon tidak boleh negatif.'],
            ]);
        }

        if ($discount > $subtotal) {
            throw ValidationException::withMessages([
                'discount' => ['Diskon tidak boleh melebihi subtotal.'],
            ]);
        }
    }
}
