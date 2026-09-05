<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'income_date' => $this->income_date?->format('Y-m-d'),
            'source_type' => $this->source_type,
            'source' => $this->source,
            'payment_id' => $this->payment_id,
            'invoice_id' => $this->invoice_id,
            'invoice_number' => $this->whenLoaded('invoice', fn () => $this->invoice?->invoice_number),
            'client' => $this->whenLoaded('invoice', fn () => $this->invoice?->client?->name),
            'category' => $this->category,
            'description' => $this->description,
            'amount' => $this->amount,
            'account_id' => $this->account_id,
            'notes' => $this->notes,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
        ];
    }
}
