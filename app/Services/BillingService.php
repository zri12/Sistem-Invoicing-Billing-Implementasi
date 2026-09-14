<?php

namespace App\Services;

use App\Models\Invoice;
use Carbon\Carbon;

class BillingService
{
    /**
     * @return array{total: float, total_paid: float, remaining: float, status: string}
     */
    public function summarize(Invoice $invoice): array
    {
        $total = (float) $invoice->total;
        $totalPaid = $invoice->relationLoaded('payments')
            ? (float) $invoice->payments->sum('amount')
            : (float) $invoice->payments()->sum('amount');
        $remaining = max(0.0, $total - $totalPaid);

        return [
            'total' => $total,
            'total_paid' => $totalPaid,
            'remaining' => $remaining,
            'status' => $this->status($invoice, $total, $totalPaid, $remaining),
        ];
    }

    /**
     * Priority: paid > overdue > partial > unpaid. due_date == today is NOT
     * overdue according to the invoice due date.
     */
    private function status(Invoice $invoice, float $total, float $totalPaid, float $remaining): string
    {
        if ($remaining <= 0 && $totalPaid > 0) {
            return 'paid';
        }

        if ($invoice->due_date && $invoice->due_date->lt(Carbon::today())) {
            return 'overdue';
        }

        if ($totalPaid > 0) {
            return 'partial';
        }

        return 'unpaid';
    }
}
