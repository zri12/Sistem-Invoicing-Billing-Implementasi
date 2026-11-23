<?php

namespace App\Http\Requests\ProductService;

use App\Models\ProductService;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ProductService::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', new \App\Rules\UniqueMasterValue(\App\Models\ProductService::class, 'name', 'Nama produk / layanan')],
            'description' => ['required', 'string'],
            'default_price' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
        ];
    }
}
