<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'tagline' => $this->tagline,
            'signing_city' => $this->signing_city,
            'signer_name' => $this->signer_name,
            'signer_title' => $this->signer_title,
            'logo_url' => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null,
            'stamp_url' => $this->stamp_path ? Storage::disk('public')->url($this->stamp_path) : null,
            'signature_url' => $this->signature_path ? Storage::disk('public')->url($this->signature_path) : null,
        ];
    }
}
