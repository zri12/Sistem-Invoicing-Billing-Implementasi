<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateInvoiceNumberSettingRequest;
use App\Http\Resources\InvoiceNumberSettingResource;
use App\Models\InvoiceNumberSetting;

class InvoiceNumberSettingController extends Controller
{
    use ApiResponses;

    public function show()
    {
        $this->authorize('view', InvoiceNumberSetting::class);

        return $this->success(new InvoiceNumberSettingResource($this->row()));
    }

    public function update(UpdateInvoiceNumberSettingRequest $request)
    {
        $settings = $this->row();
        $settings->update($request->validated());

        return $this->success(new InvoiceNumberSettingResource($settings), 'Pengaturan penomoran berhasil disimpan.');
    }

    private function row(): InvoiceNumberSetting
    {
        return InvoiceNumberSetting::query()->first() ?? InvoiceNumberSetting::create([]);
    }
}
