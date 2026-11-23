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
            'name' => ['required', 'string', 'max:255', new \App\Rules\UniqueMasterValue(\App\Models\ProductService::class, 'name', 'Nama produk / layanan', $this->route('product_service'))],
            'description' => ['required', 'string'],
            'default_price' => ['required', 'numeric', 'decimal:0,2', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
        ];
    }
}
