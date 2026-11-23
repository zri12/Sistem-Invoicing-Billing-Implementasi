<?php

namespace App\Http\Requests\Client;

use App\Models\Client;
use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Client::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', new \App\Rules\UniqueMasterValue(\App\Models\Client::class, 'name', 'Nama klien / perusahaan')],
            'pic_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
