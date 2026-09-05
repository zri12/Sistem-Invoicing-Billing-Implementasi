<?php

namespace App\Http\Requests\Expense;

use App\Models\Expense;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Expense::class);
    }

    public function rules(): array
    {
        return [
            'expense_date' => ['required', 'date'],
            'vendor_id' => ['nullable', 'integer', 'exists:vendors,id'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'source_account_id' => ['required', 'integer', 'exists:accounts,id'],
            'transaction_type' => ['required', 'in:cash,qris,credit,transfer'],
            'destination_account' => ['required_if:transaction_type,transfer', 'nullable', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
