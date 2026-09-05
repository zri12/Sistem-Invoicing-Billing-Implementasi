<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'code' => strtoupper(fake()->lexify('???')),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'website' => fake()->domainName(),
            'tagline' => 'Professional & Valuable Digital Transformation',
            'signing_city' => fake()->city(),
            'signer_name' => fake()->name(),
            'signer_title' => 'Admin Keuangan',
            'logo_path' => null,
            'stamp_path' => null,
            'signature_path' => null,
        ];
    }
}
