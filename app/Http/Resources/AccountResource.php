<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'account_number' => $this->account_number,
            'account_holder' => $this->account_holder,
            'branch' => $this->branch,
            'opening_balance' => $this->opening_balance,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
