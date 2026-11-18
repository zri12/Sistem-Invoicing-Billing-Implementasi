<?php

namespace App\Http\Requests\Invoice;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('invoice'));
    }

    public function rules(): array
    {
        return [
            'invoice_name' => ['required', 'string', 'max:255'],
            'client_id' => ['required', 'integer', Rule::exists('clients', 'id')->where(fn ($q) => $q->where('status', 'aktif')->orWhere('id', $this->route('invoice')->client_id))],
            'invoice_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:invoice_date'],
            'payment_account_id' => ['required', 'integer', Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('status', 'aktif')->orWhere('id', $this->route('invoice')->payment_account_id))],
            'discount' => ['nullable', 'numeric', 'decimal:0,2', 'min:0'],
            'payment_terms' => ['nullable', 'string'],
            'invoice_notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['sometimes', 'integer'],
            'items.*.product_service_id' => ['nullable', 'integer', Rule::exists('products_services', 'id')->where(fn ($q) => $q->where('status', 'aktif')->orWhereIn('id', $this->route('invoice')->items()->pluck('product_service_id')))],
            'items.*.description' => ['required', 'string'],
            'items.*.price' => ['required', 'numeric', 'decimal:0,2', 'min:0.01'],
            'items.*.qty' => ['required', 'numeric', 'decimal:0,2', 'min:0.01'],
        ];
    }
}
