<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductService\StoreProductServiceRequest;
use App\Http\Requests\ProductService\UpdateProductServiceRequest;
use App\Http\Resources\ProductServiceResource;
use App\Models\ProductService;
use Illuminate\Http\Request;

class ProductServiceController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $this->authorize('viewAny', ProductService::class);

        $products = ProductService::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->string('search').'%'))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => ProductServiceResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(StoreProductServiceRequest $request)
    {
        $product = ProductService::create([...$request->validated(), 'status' => 'aktif']);

        return $this->success(new ProductServiceResource($product), 'Produk & layanan berhasil ditambahkan.', 201);
    }

    public function show(ProductService $productService)
    {
        $this->authorize('view', $productService);

        return $this->success(new ProductServiceResource($productService));
    }

    public function update(UpdateProductServiceRequest $request, ProductService $productService)
    {
        $productService->update($request->validated());

        return $this->success(new ProductServiceResource($productService), 'Produk & layanan berhasil diperbarui.');
    }

    public function updateStatus(ProductService $productService)
    {
        $this->authorize('changeStatus', $productService);
        $productService->update(['status' => $productService->status === 'aktif' ? 'nonaktif' : 'aktif']);

        return $this->success(new ProductServiceResource($productService), 'Status berhasil diperbarui.');
    }
}
