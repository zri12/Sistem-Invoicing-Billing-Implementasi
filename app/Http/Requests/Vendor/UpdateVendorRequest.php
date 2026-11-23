<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVendorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('vendor'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', new \App\Rules\UniqueMasterValue(\App\Models\Vendor::class, 'name', 'Nama vendor', $this->route('vendor'))],
            'pic_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
