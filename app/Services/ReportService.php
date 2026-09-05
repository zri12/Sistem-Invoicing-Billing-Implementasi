<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Income;
use App\Models\Invoice;
use App\Models\Payment;

class ReportService
{
    /**
     * Debit = Income, Kredit = Expense (source_account_id, never the free-text
     * destination_account). Simple cashbook scope only - not double-entry
     * accounting. Opening balance is intentionally excluded from the ending
     * balance: it remains a REVIEW decision (D-009) with no locked behavior,
     * so the formula stays exactly what BUSINESS_RULES.md / the current
     * frontend already compute (debit - credit), and can gain an
     * opening_balance term later without breaking this contract.
     */
    public function cashbook(array $filters): array
    {
        $incomes = Income::query()
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->where('income_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->where('income_date', '<=', $v))
            ->when($filters['account_id'] ?? null, fn ($q, $v) => $q->where('account_id', $v))
            ->get()
            ->map(fn (Income $income) => [
                'id' => "income-{$income->id}",
                'date' => $income->income_date->format('Y-m-d'),
                'type' => 'debit',
                'source' => $income->source_type,
                'account_id' => $income->account_id,
                'description' => $income->description,
                'amount' => (float) $income->amount,
            ]);

        $expenses = Expense::query()
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->where('expense_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->where('expense_date', '<=', $v))
            ->when($filters['account_id'] ?? null, fn ($q, $v) => $q->where('source_account_id', $v))
            ->get()
            ->map(fn (Expense $expense) => [
                'id' => "expense-{$expense->id}",
                'date' => $expense->expense_date->format('Y-m-d'),
                'type' => 'credit',
                'source' => 'expense',
                'account_id' => $expense->source_account_id,
                'description' => $expense->description,
                'amount' => (float) $expense->amount,
            ]);

        $entries = $incomes->concat($expenses)->sortBy('date')->values();
        $debit = (float) $incomes->sum('amount');
        $credit = (float) $expenses->sum('amount');

        return [
            'entries' => $entries,
            'debit' => $debit,
            'credit' => $credit,
            'balance' => $debit - $credit,
        ];
    }

    public function invoices(array $filters)
    {
        return Invoice::query()
            ->with('client')
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->where('invoice_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->where('invoice_date', '<=', $v))
            ->when($filters['account_id'] ?? null, fn ($q, $v) => $q->where('payment_account_id', $v))
            ->orderBy('invoice_date')
            ->get();
    }

    public function payments(array $filters)
    {
        return Payment::query()
            ->with(['invoice', 'account'])
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->where('payment_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->where('payment_date', '<=', $v))
            ->when($filters['account_id'] ?? null, fn ($q, $v) => $q->where('account_id', $v))
            ->orderBy('payment_date')
            ->get();
    }

    public function incomes(array $filters)
    {
        return Income::query()
            ->with('invoice.client')
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->where('income_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->where('income_date', '<=', $v))
            ->when($filters['account_id'] ?? null, fn ($q, $v) => $q->where('account_id', $v))
            ->orderBy('income_date')
            ->get();
    }

    public function expenses(array $filters)
    {
        return Expense::query()
            ->with('vendor')
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->where('expense_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->where('expense_date', '<=', $v))
            ->when($filters['account_id'] ?? null, fn ($q, $v) => $q->where('source_account_id', $v))
            ->orderBy('expense_date')
            ->get();
    }
}
