<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Payment;
use Illuminate\Http\Request;

class RecentActivityController extends Controller
{
    public function __invoke(Request $request)
    {
        $this->authorize('viewAny', Payment::class);
        $this->authorize('viewAny', Income::class);
        $this->authorize('viewAny', Expense::class);

        $payments = Payment::query()->with('invoice')->latest('created_at')->latest('id')->limit(10)->get()
            ->map(fn ($item) => ['id' => 'payment-'.$item->id, 'type' => 'payment', 'description' => 'Pembayaran invoice '.($item->invoice?->invoice_number ?? ''), 'amount' => (float) $item->amount, 'created_at' => $item->created_at?->toISOString()]);
        $incomes = Income::query()->where('source_type', 'manual')->latest('created_at')->latest('id')->limit(10)->get()
            ->map(fn ($item) => ['id' => 'income-'.$item->id, 'type' => 'income', 'description' => $item->description, 'amount' => (float) $item->amount, 'created_at' => $item->created_at?->toISOString()]);
        $expenses = Expense::query()->latest('created_at')->latest('id')->limit(10)->get()
            ->map(fn ($item) => ['id' => 'expense-'.$item->id, 'type' => 'expense', 'description' => $item->description, 'amount' => (float) $item->amount, 'created_at' => $item->created_at?->toISOString()]);

        return response()->json(['data' => $payments->concat($incomes)->concat($expenses)->sortByDesc('created_at')->take(10)->values()]);
    }
}
