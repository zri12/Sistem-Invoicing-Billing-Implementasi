<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceTemplateSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->title,
            'show_logo' => $this->show_logo,
            'show_tagline' => $this->show_tagline,
            'show_title' => $this->show_title,
            'show_number' => $this->show_number,
            'show_invoice_date' => $this->show_invoice_date,
            'show_due_date' => $this->show_due_date,
            'show_client' => $this->show_client,
            'show_items' => $this->show_items,
            'show_subtotal' => $this->show_subtotal,
            'show_discount' => $this->show_discount,
            'show_total' => $this->show_total,
            'show_bank_info' => $this->show_bank_info,
            'show_terms' => $this->show_terms,
            'show_stamp' => $this->show_stamp,
            'show_signature' => $this->show_signature,
            'show_signer_name' => $this->show_signer_name,
            'show_signer_position' => $this->show_signer_position,
        ];
    }
}
