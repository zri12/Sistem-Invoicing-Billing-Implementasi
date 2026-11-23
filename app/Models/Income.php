<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Income extends Model
{
    use HasFactory;

    protected $fillable = [
        'income_date',
        'source_type',
        'source',
        'payment_id',
        'invoice_id',
        'category',
        'description',
        'amount',
        'account_id',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'payment_id' => 'integer',
            'invoice_id' => 'integer',
            'account_id' => 'integer',
            'created_by' => 'integer',
            'income_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
