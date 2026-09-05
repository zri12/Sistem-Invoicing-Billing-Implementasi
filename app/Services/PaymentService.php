<?php

namespace App\Services;

use App\Models\Income;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    /**
     * Atomic Payment -> Income flow (BUSINESS_RULES.md section 5, CLAUDE.md
     * 11.7). Locks the invoice row for the duration of the transaction so
     * concurrent payment requests against the same invoice serialize instead
     * of both reading a stale "remaining" value - the classic double-payment
     * race (two requests each paying 800.000 against a 1.000.000 remaining
     * balance) is prevented because the second transaction re-reads the
     * authoritative sum only after the first has committed and released the
     * lock.
     */
    public function recordPayment(Invoice $invoice, array $data, ?int $userId): Payment
    {
        return DB::transaction(function () use ($invoice, $data, $userId) {
            $locked = Invoice::query()->lockForUpdate()->findOrFail($invoice->id);

            if ($locked->document_status !== 'published') {
                throw ValidationException::withMessages([
                    'invoice' => ['Pembayaran hanya dapat dicatat untuk invoice yang diterbitkan.'],
                ]);
            }

            $totalPaid = (float) $locked->payments()->sum('amount');
            $remaining = (float) $locked->total - $totalPaid;

            if ($remaining <= 0) {
                throw ValidationException::withMessages([
                    'amount' => ['Invoice ini sudah lunas.'],
                ]);
            }

            $amount = (float) $data['amount'];

            if ($amount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => ['Nominal pembayaran harus lebih dari 0.'],
                ]);
            }

            // Never clamp to remaining - overpayment must be rejected outright.
            if ($amount > $remaining) {
                throw ValidationException::withMessages([
                    'amount' => ['Nominal pembayaran melebihi sisa tagihan.'],
                ]);
            }

            $proofPath = null;
            if (! empty($data['proof'])) {
                $proofPath = $data['proof']->store('proofs/payments', 'public');
            }

            $payment = $locked->payments()->create([
                'payment_date' => $data['payment_date'],
                'amount' => $amount,
                'method' => $data['method'],
                'account_id' => $data['account_id'],
                'reference_number' => $data['reference_number'] ?? null,
                'proof_path' => $proofPath,
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            Income::create([
                'income_date' => $payment->payment_date,
                'source_type' => 'invoice',
                'source' => 'invoice',
                'payment_id' => $payment->id,
                'invoice_id' => $locked->id,
                'category' => 'Pendapatan Jasa',
                'description' => "Pembayaran Invoice {$locked->invoice_number}",
                'amount' => $payment->amount,
                'account_id' => $payment->account_id,
                'created_by' => $userId,
            ]);

            return $payment;
        });
    }
}
