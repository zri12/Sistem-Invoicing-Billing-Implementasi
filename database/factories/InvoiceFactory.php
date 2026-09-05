<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'invoice_number' => strtoupper(fake()->unique()->bothify('###/INV/RKA/??/##')),
            'invoice_name' => ucwords(fake()->words(3, true)),
            'client_id' => Client::factory(),
            'invoice_date' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'due_date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'document_status' => 'draft',
            'subtotal' => 0,
            'discount' => 0,
            'total' => 0,
            'payment_account_id' => Account::factory(),
            'payment_terms' => 'Silakan lakukan pembayaran ke rekening yang tertera di atas',
            'invoice_notes' => null,
            'created_by' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => ['document_status' => 'published']);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['document_status' => 'cancelled']);
    }
}
