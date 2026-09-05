<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Expense;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'expense_date' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'vendor_id' => null,
            'category' => fake()->randomElement(['Operasional', 'Infrastruktur', 'Peralatan', 'Marketing']),
            'description' => fake()->sentence(),
            'amount' => fake()->randomFloat(2, 50000, 2000000),
            'source_account_id' => Account::factory(),
            'transaction_type' => 'cash',
            'destination_account' => null,
            'reference_number' => null,
            'proof_path' => null,
            'notes' => null,
            'created_by' => null,
        ];
    }

    public function transfer(): static
    {
        return $this->state(fn () => [
            'transaction_type' => 'transfer',
            'destination_account' => fake()->company().' - '.fake()->numerify('##########'),
        ]);
    }
}
