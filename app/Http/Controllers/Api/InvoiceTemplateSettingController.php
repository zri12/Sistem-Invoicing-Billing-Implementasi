<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateInvoiceTemplateSettingRequest;
use App\Http\Resources\CompanyResource;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\InvoiceTemplateSettingResource;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceTemplateSetting;

class InvoiceTemplateSettingController extends Controller
{
    use ApiResponses;

    public function show()
    {
        $this->authorize('view', InvoiceTemplateSetting::class);

        return $this->success(new InvoiceTemplateSettingResource($this->row()));
    }

    public function preview()
    {
        $this->authorize('view', InvoiceTemplateSetting::class);

        $company = Company::query()->first() ?? Company::create(['name' => 'PT. Ruang Kreasi Aplikasi']);
        $invoice = Invoice::query()
            ->with(['client', 'paymentAccount', 'items'])
            ->latest('invoice_date')
            ->first();

        return $this->success([
            'company' => new CompanyResource($company),
            'template' => new InvoiceTemplateSettingResource($this->row()),
            'invoice' => $invoice ? new InvoiceResource($invoice) : null,
        ]);
    }

    public function update(UpdateInvoiceTemplateSettingRequest $request)
    {
        $settings = $this->row();
        $settings->update($request->validated());

        return $this->success(new InvoiceTemplateSettingResource($settings), 'Template berhasil disimpan.');
    }

    private function row(): InvoiceTemplateSetting
    {
        return InvoiceTemplateSetting::query()->first() ?? InvoiceTemplateSetting::create([]);
    }
}
