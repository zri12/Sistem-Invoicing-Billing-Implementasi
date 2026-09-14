<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->string('role')))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([...$request->validated(), 'status' => $request->validated('status') ?? 'aktif']);

        return $this->success(new UserResource($user), 'Pengguna berhasil ditambahkan.', 201);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        return $this->success(new UserResource($user));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        // Safety rail: an Admin cannot
        // downgrade their own role, mirroring the existing frontend guard
        // (Users.vue) that this backend must not regress below.
        if ($request->user()->id === $user->id && $request->validated('role') !== 'admin') {
            throw ValidationException::withMessages([
                'role' => ['Role pengguna yang sedang aktif tidak dapat diturunkan.'],
            ]);
        }

        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return $this->success(new UserResource($user), 'Data pengguna berhasil diperbarui.');
    }

    public function updateStatus(Request $request, User $user)
    {
        $this->authorize('changeStatus', $user);

        if ($request->user()->id === $user->id && $user->status === 'aktif') {
            throw ValidationException::withMessages([
                'status' => ['Pengguna yang sedang aktif tidak dapat menonaktifkan akun sendiri.'],
            ]);
        }

        $user->update(['status' => $user->status === 'aktif' ? 'nonaktif' : 'aktif']);

        return $this->success(new UserResource($user), 'Status pengguna berhasil diperbarui.');
    }
}
