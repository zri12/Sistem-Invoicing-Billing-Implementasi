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
            'name' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
            'description' => ['nullable', 'string'],
            'default_price' => ['required', 'numeric', 'decimal:0,2', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
        ];
    }
}
