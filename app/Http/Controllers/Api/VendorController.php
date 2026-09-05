<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Http\Resources\ExpenseResource;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Vendor::class);

        $vendors = Vendor::query()
            ->withCount('expenses')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->string('search').'%'))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => VendorResource::collection($vendors->items()),
            'meta' => [
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
                'per_page' => $vendors->perPage(),
                'total' => $vendors->total(),
            ],
        ]);
    }

    public function store(StoreVendorRequest $request)
    {
        $vendor = Vendor::create([...$request->validated(), 'status' => 'aktif']);

        return $this->success(new VendorResource($vendor), 'Vendor berhasil ditambahkan.', 201);
    }

    public function show(Vendor $vendor)
    {
        $this->authorize('view', $vendor);
        $vendor->loadCount('expenses');

        return $this->success(new VendorResource($vendor));
    }

    public function update(UpdateVendorRequest $request, Vendor $vendor)
    {
        $vendor->update($request->validated());

        return $this->success(new VendorResource($vendor), 'Data vendor berhasil diperbarui.');
    }

    public function updateStatus(Vendor $vendor)
    {
        $this->authorize('changeStatus', $vendor);
        $vendor->update(['status' => $vendor->status === 'aktif' ? 'nonaktif' : 'aktif']);

        return $this->success(new VendorResource($vendor), 'Status vendor berhasil diperbarui.');
    }

    public function expenses(Vendor $vendor)
    {
        $this->authorize('view', $vendor);
        $expenses = $vendor->expenses()->latest('expense_date')->get();

        return $this->success(ExpenseResource::collection($expenses));
    }
}
