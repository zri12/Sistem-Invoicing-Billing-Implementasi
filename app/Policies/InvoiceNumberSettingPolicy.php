<?php

namespace App\Policies;

use App\Models\User;

/**
 * Same resolution as InvoiceTemplateSettingPolicy: frontend baseline allows
 * Manager to reach /penomoran-invoice read-only, so read access is allowed
 * here to match existing behavior. Write remains Admin-only.
 */
class InvoiceNumberSettingPolicy
{
    public function view(User $user): bool
    {
        return true;
    }

    public function update(User $user): bool
    {
        return $user->isAdmin();
    }
}
