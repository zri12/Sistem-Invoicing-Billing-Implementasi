<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('account'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:100', new \App\Rules\UniqueMasterValue(\App\Models\Account::class, 'account_number', 'Nomor rekening', $this->route('account'))],
            'account_holder' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
            'branch' => ['nullable', 'string', 'max:255'],
            'opening_balance' => ['nullable', 'numeric', 'decimal:0,2', 'min:0'],
        ];
    }
}
