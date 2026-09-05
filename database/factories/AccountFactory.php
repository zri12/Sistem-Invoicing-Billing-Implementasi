<?php

namespace Database\Factories;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI', 'Kas Kantor']),
            'account_number' => fake()->numerify('##########'),
            'account_holder' => 'PT. Ruang Kreasi Aplikasi',
            'branch' => null,
            'opening_balance' => 0,
            'status' => 'aktif',
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['status' => 'nonaktif']);
    }
}
