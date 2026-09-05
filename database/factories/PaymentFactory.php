<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory()->published(),
            'payment_date' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'amount' => fake()->randomFloat(2, 100000, 5000000),
            'method' => fake()->randomElement(['cash', 'transfer', 'cheque', 'qris']),
            'account_id' => Account::factory(),
            'reference_number' => strtoupper(fake()->bothify('TRF-########-###')),
            'proof_path' => null,
            'notes' => null,
            'created_by' => null,
        ];
    }
}
