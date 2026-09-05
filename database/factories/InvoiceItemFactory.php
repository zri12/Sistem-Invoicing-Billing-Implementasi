<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    protected $model = InvoiceItem::class;

    public function definition(): array
    {
        $price = fake()->randomFloat(2, 100000, 10000000);
        $qty = fake()->numberBetween(1, 3);

        return [
            'invoice_id' => Invoice::factory(),
            'product_service_id' => null,
            'product_name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'qty' => $qty,
            'price' => $price,
            'total' => $price * $qty,
        ];
    }
}
