<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Http\Resources\InvoiceResource;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Client::class);

        $clients = Client::query()
            ->withCount('invoices')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%'.$request->string('search').'%'))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return $this->success([
            'items' => ClientResource::collection($clients->items()),
            'meta' => [
                'current_page' => $clients->currentPage(),
                'last_page' => $clients->lastPage(),
                'per_page' => $clients->perPage(),
                'total' => $clients->total(),
            ],
        ]);
    }

    public function store(StoreClientRequest $request)
    {
        $client = Client::create([...$request->validated(), 'status' => 'aktif']);

        return $this->success(new ClientResource($client), 'Klien berhasil ditambahkan.', 201);
    }

    public function show(Client $client)
    {
        $this->authorize('view', $client);
        $client->loadCount('invoices');

        return $this->success(new ClientResource($client));
    }

    public function update(UpdateClientRequest $request, Client $client)
    {
        $client->update($request->validated());

        return $this->success(new ClientResource($client), 'Data klien berhasil diperbarui.');
    }

    public function updateStatus(Client $client)
    {
        $this->authorize('changeStatus', $client);
        $client->update(['status' => $client->status === 'aktif' ? 'nonaktif' : 'aktif']);

        return $this->success(new ClientResource($client), 'Status klien berhasil diperbarui.');
    }

    public function invoices(Client $client)
    {
        $this->authorize('view', $client);
        $invoices = $client->invoices()->latest('invoice_date')->get();

        return $this->success(InvoiceResource::collection($invoices));
    }
}
