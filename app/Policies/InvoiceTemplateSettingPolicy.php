<?php

namespace App\Policies;

use App\Models\User;

/**
 * Resolves AUTHORIZATION_MATRIX.md section 5.2 ("Manager read = NEEDS
 * CONFIRMATION") for Template settings: the frontend baseline already lets
 * Manager navigate directly to /template-invoice (router has no adminOnly
 * guard on that route, only a disabled form), so read access is allowed here
 * to match existing behavior. Write remains Admin-only. Revisit if the
 * company gives an explicit contrary decision.
 */
class InvoiceTemplateSettingPolicy
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
