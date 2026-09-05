<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Account::class);

        $accounts = Account::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->string('search').'%'))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => AccountResource::collection($accounts->items()),
            'meta' => [
                'current_page' => $accounts->currentPage(),
                'last_page' => $accounts->lastPage(),
                'per_page' => $accounts->perPage(),
                'total' => $accounts->total(),
            ],
        ]);
    }

    public function store(StoreAccountRequest $request)
    {
        $account = Account::create([...$request->validated(), 'status' => 'aktif']);

        return $this->success(new AccountResource($account), 'Rekening berhasil ditambahkan.', 201);
    }

    public function show(Account $account)
    {
        $this->authorize('view', $account);

        return $this->success(new AccountResource($account));
    }

    public function update(UpdateAccountRequest $request, Account $account)
    {
        $account->update($request->validated());

        return $this->success(new AccountResource($account), 'Data rekening berhasil diperbarui.');
    }

    public function updateStatus(Account $account)
    {
        $this->authorize('changeStatus', $account);
        $account->update(['status' => $account->status === 'aktif' ? 'nonaktif' : 'aktif']);

        return $this->success(new AccountResource($account), 'Status rekening berhasil diperbarui.');
    }
}
