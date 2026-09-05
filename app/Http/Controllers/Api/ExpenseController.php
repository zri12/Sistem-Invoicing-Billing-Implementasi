<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Expense::class);

        $expenses = Expense::query()
            ->with('vendor')
            ->when($request->filled('vendor_id'), fn ($q) => $q->where('vendor_id', $request->integer('vendor_id')))
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))
            ->when($request->filled('transaction_type'), fn ($q) => $q->where('transaction_type', $request->string('transaction_type')))
            ->when($request->filled('from'), fn ($q) => $q->where('expense_date', '>=', $request->string('from')))
            ->when($request->filled('to'), fn ($q) => $q->where('expense_date', '<=', $request->string('to')))
            ->latest('expense_date')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => ExpenseResource::collection($expenses->items()),
            'meta' => [
                'current_page' => $expenses->currentPage(),
                'last_page' => $expenses->lastPage(),
                'per_page' => $expenses->perPage(),
                'total' => $expenses->total(),
            ],
        ]);
    }

    public function store(StoreExpenseRequest $request)
    {
        $data = $request->validated();
        // Non-transfer types never persist a destination account, even if
        // the client sent stale data from a previous "Transfer" selection.
        if ($data['transaction_type'] !== 'transfer') {
            $data['destination_account'] = null;
        }

        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('proofs/expenses', 'public');
        }

        $expense = Expense::create([
            ...$data,
            'proof_path' => $proofPath,
            'created_by' => $request->user()->id,
        ]);

        return $this->success(new ExpenseResource($expense->load('vendor')), 'Pengeluaran berhasil ditambahkan.', 201);
    }

    public function show(Expense $expense)
    {
        $this->authorize('view', $expense);

        return $this->success(new ExpenseResource($expense->load('vendor')));
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $data = $request->validated();
        if ($data['transaction_type'] !== 'transfer') {
            $data['destination_account'] = null;
        }

        if ($request->hasFile('proof')) {
            $data['proof_path'] = $request->file('proof')->store('proofs/expenses', 'public');
        }

        $expense->update($data);

        return $this->success(new ExpenseResource($expense->load('vendor')), 'Pengeluaran berhasil diperbarui.');
    }
}
