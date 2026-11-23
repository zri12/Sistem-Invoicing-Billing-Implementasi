<?php

namespace App\Http\Requests\Income;

use App\Models\Income;
use Illuminate\Foundation\Http\FormRequest;

class StoreIncomeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Income::class);
    }

    public function rules(): array
    {
        return [
            'income_date' => ['required', 'date'],
            'source' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'min:0.01'],
            'account_id' => ['required', 'integer', 'exists:accounts,id,status,aktif'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
