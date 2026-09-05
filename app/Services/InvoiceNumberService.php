<?php

namespace App\Services;

use App\Models\InvoiceNumberSetting;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Concurrency-safe invoice number generation. Uses a single settings row with
 * a row-level lock (SELECT ... FOR UPDATE inside a transaction) plus an
 * atomic increment, so two simultaneous invoice creations cannot receive the
 * same sequence number. Reset policy is locked to "continuous" per the
 * approved decision (D-007 resolved this session) - month/year are used only
 * for formatting, never for resetting the counter.
 */
class InvoiceNumberService
{
    private const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

    public function generate(CarbonInterface $date): string
    {
        return DB::transaction(function () use ($date) {
            $settings = InvoiceNumberSetting::query()->lockForUpdate()->first();

            if (! $settings) {
                $settings = InvoiceNumberSetting::create([]);
                $settings = InvoiceNumberSetting::query()->lockForUpdate()->find($settings->id);
            }

            $settings->increment('last_sequence');

            return $this->format($settings, (int) $settings->last_sequence, $date);
        });
    }

    private function format(InvoiceNumberSetting $settings, int $sequence, CarbonInterface $date): string
    {
        $seq = str_pad((string) $sequence, max(1, $settings->digits), '0', STR_PAD_LEFT);

        $month = $settings->month_format === 'romawi'
            ? self::ROMAN_MONTHS[$date->month - 1]
            : str_pad((string) $date->month, 2, '0', STR_PAD_LEFT);

        $year = $settings->year_format === '2digit'
            ? $date->format('y')
            : $date->format('Y');

        return "{$seq}/{$settings->document_code}/{$settings->company_code}/{$month}/{$year}";
    }
}
