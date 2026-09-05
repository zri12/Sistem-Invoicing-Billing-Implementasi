<?php

namespace Database\Factories;

use App\Models\InvoiceTemplateSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceTemplateSetting>
 */
class InvoiceTemplateSettingFactory extends Factory
{
    protected $model = InvoiceTemplateSetting::class;

    public function definition(): array
    {
        return [
            'title' => 'INVOICE',
            'show_logo' => true,
            'show_tagline' => true,
            'show_title' => true,
            'show_number' => true,
            'show_invoice_date' => true,
            'show_due_date' => true,
            'show_client' => true,
            'show_items' => true,
            'show_subtotal' => true,
            'show_discount' => true,
            'show_total' => true,
            'show_bank_info' => true,
            'show_terms' => true,
            'show_stamp' => true,
            'show_signature' => true,
            'show_signer_name' => true,
            'show_signer_position' => true,
        ];
    }
}
