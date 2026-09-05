<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expense_date' => $this->expense_date?->format('Y-m-d'),
            'vendor_id' => $this->vendor_id,
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
            'category' => $this->category,
            'description' => $this->description,
            'amount' => $this->amount,
            'source_account_id' => $this->source_account_id,
            'transaction_type' => $this->transaction_type,
            'destination_account' => $this->destination_account,
            'reference_number' => $this->reference_number,
            'proof_url' => $this->proof_path ? Storage::disk('public')->url($this->proof_path) : null,
            'notes' => $this->notes,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
        ];
    }
}
