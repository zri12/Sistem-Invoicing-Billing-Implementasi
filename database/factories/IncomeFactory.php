<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Income;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Income>
 */
class IncomeFactory extends Factory
{
    protected $model = Income::class;

    public function definition(): array
    {
        return [
            'income_date' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'source_type' => 'manual',
            'source' => 'Lain-lain',
            'payment_id' => null,
            'invoice_id' => null,
            'category' => fake()->randomElement(['Pendapatan Lainnya', 'Pendapatan Jasa']),
            'description' => fake()->sentence(),
            'amount' => fake()->randomFloat(2, 100000, 5000000),
            'account_id' => Account::factory(),
            'notes' => null,
            'created_by' => null,
        ];
    }
}
