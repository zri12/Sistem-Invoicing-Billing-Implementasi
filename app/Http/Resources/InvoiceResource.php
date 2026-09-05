<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'invoice_name' => $this->invoice_name,
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'invoice_date' => $this->invoice_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'document_status' => $this->document_status,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'total' => $this->total,
            'payment_account_id' => $this->payment_account_id,
            'payment_account' => new AccountResource($this->whenLoaded('paymentAccount')),
            'payment_terms' => $this->payment_terms,
            'invoice_notes' => $this->invoice_notes,
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
