<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceNumberSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'document_code' => $this->document_code,
            'company_code' => $this->company_code,
            'digits' => $this->digits,
            'month_format' => $this->month_format,
            'year_format' => $this->year_format,
            'reset_rule' => $this->reset_rule,
        ];
    }
}
