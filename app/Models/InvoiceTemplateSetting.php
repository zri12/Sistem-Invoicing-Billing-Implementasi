<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceTemplateSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'show_logo',
        'show_tagline',
        'show_title',
        'show_number',
        'show_invoice_date',
        'show_due_date',
        'show_client',
        'show_items',
        'show_subtotal',
        'show_discount',
        'show_total',
        'show_bank_info',
        'show_terms',
        'show_stamp',
        'show_signature',
        'show_signer_name',
        'show_signer_position',
    ];

    protected function casts(): array
    {
        return [
            'show_logo' => 'boolean',
            'show_tagline' => 'boolean',
            'show_title' => 'boolean',
            'show_number' => 'boolean',
            'show_invoice_date' => 'boolean',
            'show_due_date' => 'boolean',
            'show_client' => 'boolean',
            'show_items' => 'boolean',
            'show_subtotal' => 'boolean',
            'show_discount' => 'boolean',
            'show_total' => 'boolean',
            'show_bank_info' => 'boolean',
            'show_terms' => 'boolean',
            'show_stamp' => 'boolean',
            'show_signature' => 'boolean',
            'show_signer_name' => 'boolean',
            'show_signer_position' => 'boolean',
        ];
    }
}
