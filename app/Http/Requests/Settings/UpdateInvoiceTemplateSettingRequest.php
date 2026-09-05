<?php

namespace App\Http\Requests\Settings;

use App\Models\InvoiceTemplateSetting;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceTemplateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', InvoiceTemplateSetting::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'show_logo' => ['boolean'],
            'show_tagline' => ['boolean'],
            'show_title' => ['boolean'],
            'show_number' => ['boolean'],
            'show_invoice_date' => ['boolean'],
            'show_due_date' => ['boolean'],
            'show_client' => ['boolean'],
            'show_items' => ['boolean'],
            'show_subtotal' => ['boolean'],
            'show_discount' => ['boolean'],
            'show_total' => ['boolean'],
            'show_bank_info' => ['boolean'],
            'show_terms' => ['boolean'],
            'show_stamp' => ['boolean'],
            'show_signature' => ['boolean'],
            'show_signer_name' => ['boolean'],
            'show_signer_position' => ['boolean'],
        ];
    }
}
