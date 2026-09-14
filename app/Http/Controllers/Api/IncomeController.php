<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Income\StoreIncomeRequest;
use App\Http\Requests\Income\UpdateIncomeRequest;
use App\Http\Resources\IncomeResource;
use App\Models\Income;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class IncomeController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Income::class);

        $incomes = Income::query()
            ->with('invoice.client')
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))
            ->when($request->filled('account_id'), fn ($q) => $q->where('account_id', $request->integer('account_id')))
            ->when($request->filled('source_type'), fn ($q) => $q->where('source_type', $request->string('source_type')))
            ->when($request->filled('from'), fn ($q) => $q->where('income_date', '>=', $request->string('from')))
            ->when($request->filled('to'), fn ($q) => $q->where('income_date', '<=', $request->string('to')))
            ->latest('income_date')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => IncomeResource::collection($incomes->items()),
            'meta' => [
                'current_page' => $incomes->currentPage(),
                'last_page' => $incomes->lastPage(),
                'per_page' => $incomes->perPage(),
                'total' => $incomes->total(),
            ],
        ]);
    }

    public function store(StoreIncomeRequest $request)
    {
        // source_type/payment_id/invoice_id are never accepted from the
        // client - this endpoint can only ever create manual, non-invoice
        // income record.
        $income = Income::create([
            ...$request->validated(),
            'source_type' => 'manual',
            'source' => $request->validated('source') ?? 'manual',
            'payment_id' => null,
            'invoice_id' => null,
            'created_by' => $request->user()->id,
        ]);

        return $this->success(new IncomeResource($income), 'Pemasukan berhasil ditambahkan.', 201);
    }

    public function update(UpdateIncomeRequest $request, Income $income)
    {
        // Payment-derived income is never editable through this endpoint.
        if ($income->source_type !== 'manual') {
            throw ValidationException::withMessages([
                'source_type' => ['Pemasukan dari pembayaran invoice tidak dapat diedit secara manual.'],
            ]);
        }

        $income->update($request->validated());

        return $this->success(new IncomeResource($income), 'Pemasukan berhasil diperbarui.');
    }
}
