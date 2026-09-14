<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'payment_date' => $this->payment_date?->format('Y-m-d'),
            'amount' => $this->amount,
            'method' => $this->method,
            'account_id' => $this->account_id,
            'account' => new AccountResource($this->whenLoaded('account')),
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'reference_number' => $this->reference_number,
            'proof_url' => $this->proof_path ? Storage::disk('public')->url($this->proof_path) : null,
            'notes' => $this->notes,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
        ];
    }
}
