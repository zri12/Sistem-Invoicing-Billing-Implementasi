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
        // Changing these settings never touches invoice_number values already
        // persisted on existing invoices - only future InvoiceNumberService
        // calls read this row (B8.3 "existing invoice immutable" requirement
        // is satisfied by construction, not by extra code here).
        $settings = $this->row();
        $settings->update($request->validated());

        return $this->success(new InvoiceNumberSettingResource($settings), 'Pengaturan penomoran berhasil disimpan.');
    }

    private function row(): InvoiceNumberSetting
    {
        return InvoiceNumberSetting::query()->first() ?? InvoiceNumberSetting::create([]);
    }
}
