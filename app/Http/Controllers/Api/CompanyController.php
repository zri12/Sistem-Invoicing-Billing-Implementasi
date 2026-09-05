<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    use ApiResponses;

    public function show()
    {
        $this->authorize('view', Company::class);

        return $this->success(new CompanyResource($this->companyRow()));
    }

    public function update(UpdateCompanyRequest $request)
    {
        $company = $this->companyRow();
        $data = $request->validated();

        foreach (['logo', 'stamp', 'signature'] as $field) {
            if ($request->hasFile($field)) {
                $existing = $company->{"{$field}_path"};
                if ($existing) {
                    Storage::disk('public')->delete($existing);
                }
                $data["{$field}_path"] = $request->file($field)->store('company', 'public');
            }
        }

        $company->update($data);

        return $this->success(new CompanyResource($company), 'Data perusahaan berhasil disimpan.');
    }

    private function companyRow(): Company
    {
        return Company::query()->first() ?? Company::create(['name' => 'PT. Ruang Kreasi Aplikasi']);
    }
}
