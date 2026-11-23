<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Model;

class UniqueMasterValue implements ValidationRule
{
    public function __construct(private string $model, private string $column, private string $label, private ?Model $current = null) {}

    private function normalize(string $value): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', $value)));
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || trim($value) === '') return;
        $normalized = $this->normalize($value);
        if ($this->current && $normalized === $this->normalize((string) $this->current->{$this->column})) return;
        foreach (($this->model)::query()->select(['id', $this->column])->cursor() as $record) {
            if ($this->current && $record->is($this->current)) continue;
            if ($this->normalize((string) $record->{$this->column}) === $normalized) {
                $fail($this->label.' sudah terdaftar.');
                return;
            }
        }
    }
}
