import { defineStore } from 'pinia';
import financeService from '@/services/financeService';

let incomeListRequest = null;
let expenseListRequest = null;

export const useFinanceStore = defineStore('finance', {
    state: () => ({ incomes: [], expenses: [], loaded: { incomes: false, expenses: false } }),
    getters: {
        manualIncomes: (state) => state.incomes.filter((income) => income.source === 'manual'),
        allIncomes: (state) => state.incomes,
        cashbookEntries(state) {
            return [
                ...state.incomes.map((income) => ({ id: income.id, date: income.date, type: 'debit', source: income.source, accountId: income.accountId, description: income.description, amount: income.amount })),
                ...state.expenses.map((expense) => ({ id: expense.id, date: expense.date, type: 'credit', source: 'expense', accountId: expense.sourceAccountId, description: expense.description, amount: expense.amount })),
            ].sort((a, b) => b.date.localeCompare(a.date));
        },
    },
    actions: {
        async ensureIncomes() {
            if (this.loaded.incomes) return;
            if (!incomeListRequest) incomeListRequest = financeService.listIncomes().then((incomes) => { this.incomes = incomes; this.loaded.incomes = true; }).finally(() => { incomeListRequest = null; });
            await incomeListRequest;
        },
        async ensureExpenses() {
            if (this.loaded.expenses) return;
            if (!expenseListRequest) expenseListRequest = financeService.listExpenses().then((expenses) => { this.expenses = expenses; this.loaded.expenses = true; }).finally(() => { expenseListRequest = null; });
            await expenseListRequest;
        },
        async ensure() { await Promise.all([this.ensureIncomes(), this.ensureExpenses()]); },
        async addManualIncome(income) {
            const amount = Number(income.amount || 0);
            if (!income.date || !income.category?.trim() || !income.description?.trim() || amount <= 0) throw new Error('Lengkapi tanggal, kategori, keterangan, dan nominal pemasukan.');
            try {
                const record = await financeService.createIncome({ ...income, amount });
                this.incomes = [record, ...this.incomes];
                return record;
            } catch (error) {
                throw new Error(error.response?.data?.message || 'Gagal menyimpan pemasukan.');
            }
        },
        async updateManualIncome(id, income) {
            const amount = Number(income.amount || 0);
            if (!income.date || !income.category?.trim() || !income.description?.trim() || amount <= 0) throw new Error('Lengkapi tanggal, kategori, keterangan, dan nominal pemasukan.');
            try {
                const record = await financeService.updateIncome(id, { ...income, amount });
                this.incomes = this.incomes.map((item) => item.id === id ? record : item);
                return record;
            } catch (error) {
                throw new Error(error.response?.data?.message || 'Gagal memperbarui pemasukan.');
            }
        },
        async addExpense(expense) { return this.saveExpense(expense, false); },
        async updateExpense(id, expense) { return this.saveExpense({ ...expense, id }, true); },
        async saveExpense(expense, update) {
            const amount = Number(expense.amount || 0);
            if (!expense.date || !expense.category?.trim() || !expense.description?.trim() || amount <= 0 || !expense.transactionType || !expense.sourceAccountId) throw new Error('Lengkapi tanggal, kategori, keterangan, nominal, sumber rekening, dan jenis transaksi pengeluaran.');
            if (expense.transactionType === 'transfer' && !expense.destinationAccount?.trim()) throw new Error('Rekening tujuan wajib diisi untuk transaksi Transfer.');
            const payload = { ...expense, amount, destinationAccount: expense.transactionType === 'transfer' ? expense.destinationAccount.trim() : null };
            try {
                const record = update
                    ? await financeService.updateExpense(payload.id, payload)
                    : await financeService.createExpense(payload);
                this.expenses = update
                    ? this.expenses.map((item) => item.id === record.id ? record : item)
                    : [record, ...this.expenses];
                return record;
            } catch (error) {
                throw new Error(error.response?.data?.errors?.destination_account?.[0] || error.response?.data?.message || 'Gagal menyimpan pengeluaran.');
            }
        },
    },
});
