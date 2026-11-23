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
            'logo_url' => $this->publicAssetUrl($this->logo_path, 'logo'),
            'stamp_url' => $this->publicAssetUrl($this->stamp_path, 'stamp'),
            'signature_url' => $this->publicAssetUrl($this->signature_path, 'signature'),
        ];
    }

    private function publicAssetUrl(?string $path, string $field): ?string
    {
        $disk = Storage::disk('public');

        return $path && $disk->exists($path) ? route('company.assets', $field, false) : null;
    }
}
