<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Resources\ExpenseResource;
use App\Http\Resources\IncomeResource;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\PaymentResource;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponses;

    public function __construct(private ReportService $service)
    {
    }

    private function filters(Request $request): array
    {
        return $request->only(['from', 'to', 'account_id']);
    }

    public function cashbook(Request $request)
    {
        return $this->success($this->service->cashbook($this->filters($request)));
    }

    public function invoices(Request $request)
    {
        return $this->success(InvoiceResource::collection($this->service->invoices($this->filters($request))));
    }

    public function payments(Request $request)
    {
        return $this->success(PaymentResource::collection($this->service->payments($this->filters($request))));
    }

    public function incomes(Request $request)
    {
        return $this->success(IncomeResource::collection($this->service->incomes($this->filters($request))));
    }

    public function expenses(Request $request)
    {
        return $this->success(ExpenseResource::collection($this->service->expenses($this->filters($request))));
    }
}
