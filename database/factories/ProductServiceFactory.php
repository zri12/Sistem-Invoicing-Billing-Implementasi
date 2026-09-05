<?php

namespace Database\Factories;

use App\Models\ProductService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductService>
 */
class ProductServiceFactory extends Factory
{
    protected $model = ProductService::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'default_price' => fake()->randomFloat(2, 100000, 20000000),
            'unit' => 'project',
            'status' => 'aktif',
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['status' => 'nonaktif']);
    }
}
