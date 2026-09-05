<?php

namespace App\Policies;

use App\Models\ProductService;
use App\Models\User;

class ProductServicePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ProductService $productService): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, ProductService $productService): bool
    {
        return $user->isAdmin();
    }

    public function changeStatus(User $user, ProductService $productService): bool
    {
        return $user->isAdmin();
    }
}
