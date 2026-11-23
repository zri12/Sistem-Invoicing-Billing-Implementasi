<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Support\Facades\Storage;

class CompanyAssetController extends Controller
{
    public function show(string $field)
    {
        abort_unless(in_array($field, ['logo', 'stamp', 'signature'], true), 404);
        $company = Company::query()->firstOrFail();
        $this->authorize('view', $company);
        $path = $company->{$field.'_path'};
        abort_unless($path && Storage::disk('public')->exists($path), 404);
        return Storage::disk('public')->response($path, null, ['Cache-Control' => 'private, no-store']);
    }
}
