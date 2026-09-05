<?php

namespace App\Http\Requests\Invoice;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Invoice::class);
    }

    public function rules(): array
    {
        return [
            'invoice_name' => ['required', 'string', 'max:255'],
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'invoice_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:invoice_date'],
            'payment_account_id' => ['required', 'integer', 'exists:accounts,id'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'payment_terms' => ['nullable', 'string'],
            'invoice_notes' => ['nullable', 'string'],
            'document_status' => ['sometimes', 'in:draft,published'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_service_id' => ['nullable', 'integer', 'exists:products_services,id'],
            'items.*.description' => ['required', 'string'],
            'items.*.price' => ['required', 'numeric', 'min:0.01'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
        ];
    }
}
