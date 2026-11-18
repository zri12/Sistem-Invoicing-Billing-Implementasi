<?php

namespace App\Http\Requests\ProductService;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product_service'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
            'description' => ['nullable', 'string'],
            'default_price' => ['required', 'numeric', 'decimal:0,2', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
        ];
    }
}
