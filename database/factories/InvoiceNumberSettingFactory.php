<?php

namespace Database\Factories;

use App\Models\InvoiceNumberSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceNumberSetting>
 */
class InvoiceNumberSettingFactory extends Factory
{
    protected $model = InvoiceNumberSetting::class;

    public function definition(): array
    {
        return [
            'document_code' => 'INV',
            'company_code' => 'RKA',
            'digits' => 3,
            'month_format' => 'romawi',
            'year_format' => '2digit',
            'reset_rule' => 'continuous',
            'last_sequence' => 0,
        ];
    }
}
