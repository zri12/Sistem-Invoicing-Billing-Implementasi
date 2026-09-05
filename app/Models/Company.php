<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'address',
        'phone',
        'email',
        'website',
        'tagline',
        'signing_city',
        'signer_name',
        'signer_title',
        'logo_path',
        'stamp_path',
        'signature_path',
    ];
}
