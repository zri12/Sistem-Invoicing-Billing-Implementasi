<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceNumberSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_code',
        'company_code',
        'digits',
        'month_format',
        'year_format',
        'reset_rule',
        'last_sequence',
    ];
}
