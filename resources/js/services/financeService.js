import api from '@/services/api';

export const incomeFromApi = (i) => ({
    id: i.id,
    source: i.source_type === 'invoice' ? 'invoice' : 'manual',
    paymentId: i.payment_id,
    invoiceId: i.invoice_id,
    date: i.income_date,
    category: i.category,
    description: i.description,
    invoiceNumber: i.invoice_number || '-',
    client: i.client || '-',
    accountId: i.account_id,
    amount: Number(i.amount),
    notes: i.notes || '',
});

export const expenseFromApi = (e) => ({
    id: e.id,
    date: e.expense_date,
    vendorId: e.vendor_id,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    transactionType: e.transaction_type,
    sourceAccountId: e.source_account_id,
    destinationAccount: e.destination_account,
    referenceNumber: e.reference_number || '',
    proofName: e.proof_url ? e.proof_url.split('/').pop() : '',
    notes: e.notes || '',
});

const buildExpenseForm = (expense) => {
    const form = new FormData();
    form.append('expense_date', expense.date);
    if (expense.vendorId) form.append('vendor_id', expense.vendorId);
    form.append('category', expense.category);
    form.append('description', expense.description);
    form.append('amount', expense.amount);
    form.append('source_account_id', expense.sourceAccountId);
    form.append('transaction_type', expense.transactionType);
    if (expense.transactionType === 'transfer' && expense.destinationAccount) {
        form.append('destination_account', expense.destinationAccount);
    }
    if (expense.referenceNumber) form.append('reference_number', expense.referenceNumber);
    if (expense.notes) form.append('notes', expense.notes);
    if (expense.proofFile) form.append('proof', expense.proofFile);
    return form;
};

export default {
    async listIncomes() {
        const { data } = await api.get('/incomes', { params: { per_page: 200 } });
        return data.data.items.map(incomeFromApi);
    },
    async createIncome(income) {
        const { data } = await api.post('/incomes', {
            income_date: income.date, source: income.source || null, category: income.category,
            description: income.description, amount: Number(income.amount) || 0,
            account_id: income.accountId, notes: income.notes || null,
        });
        return incomeFromApi(data.data);
    },
    async updateIncome(id, income) {
        const { data } = await api.put(`/incomes/${id}`, {
            income_date: income.date, source: income.source || null, category: income.category,
            description: income.description, amount: Number(income.amount) || 0,
            account_id: income.accountId, notes: income.notes || null,
        });
        return incomeFromApi(data.data);
    },
    async listExpenses() {
        const { data } = await api.get('/expenses', { params: { per_page: 200 } });
        return data.data.items.map(expenseFromApi);
    },
    async createExpense(expense) {
        const { data } = await api.post('/expenses', buildExpenseForm(expense));
        return expenseFromApi(data.data);
    },
    async updateExpense(id, expense) {
        const form = buildExpenseForm(expense);
        form.append('_method', 'PUT');
        const { data } = await api.post(`/expenses/${id}`, form);
        return expenseFromApi(data.data);
    },
};
