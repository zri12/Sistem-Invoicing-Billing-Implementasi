<?php

namespace App\Http\Requests\Settings;

use App\Models\InvoiceNumberSetting;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceNumberSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', InvoiceNumberSetting::class);
    }

    public function rules(): array
    {
        return [
            'document_code' => ['required', 'string', 'max:20'],
            'company_code' => ['required', 'string', 'max:20'],
            'digits' => ['required', 'integer', 'min:1', 'max:10'],
            'month_format' => ['required', 'in:romawi,angka'],
            'year_format' => ['required', 'in:2digit,4digit'],
            // Only "continuous" is functionally implemented (D-007 resolved
            // this session). Rejecting other values here rather than
            // silently accepting a setting the service does not honor.
            'reset_rule' => ['sometimes', 'in:continuous'],
        ];
    }
}
