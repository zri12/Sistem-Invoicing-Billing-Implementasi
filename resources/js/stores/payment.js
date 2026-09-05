import { defineStore } from 'pinia';
import paymentService from '@/services/paymentService';
import { todayIso } from '@/utils/formatters';

// Prefer the backend-authoritative invoice.total; fall back to computing
// from items only for objects that never went through the API (e.g. the
// static template preview invoice in Template.vue).
const invoiceTotal = (invoice) => invoice?.total != null
    ? Number(invoice.total)
    : (invoice?.items || []).reduce((total, item) => total + Number(item.price || 0) * Number(item.qty || 0), 0) - Number(invoice?.discount || 0);

export const usePaymentStore = defineStore('payment', {
    state: () => ({ payments: [], loaded: false }),
    getters: {
        paymentsByInvoice: (state) => (invoiceId) => state.payments.filter((payment) => String(payment.invoiceId) === String(invoiceId)).sort((left, right) => right.paymentDate.localeCompare(left.paymentDate)),
        totalPaidByInvoice: (state) => (invoiceId) => state.payments.filter((payment) => String(payment.invoiceId) === String(invoiceId)).reduce((total, payment) => total + Number(payment.amount || 0), 0),
        paymentSummaryByInvoice() { return (invoice) => { const total = invoiceTotal(invoice); const totalPaid = this.totalPaidByInvoice(invoice?.id); const remaining = Math.max(total - totalPaid, 0); const status = totalPaid >= total && total > 0 ? 'lunas' : invoice?.dueDate && todayIso() > invoice.dueDate ? 'jatuh_tempo' : totalPaid > 0 ? 'dibayar_sebagian' : 'belum_dibayar'; return { total, totalPaid, remaining, status }; }; },
        invoiceIncomeEntries: (state) => state.payments.map((payment) => ({ source: 'invoice', paymentId: payment.id, invoiceId: payment.invoiceId, date: payment.paymentDate, amount: payment.amount, accountId: payment.accountId, description: `Pembayaran invoice ${payment.invoiceId}` })),
    },
    actions: {
        async ensure() {
            if (!this.loaded) {
                this.payments = await paymentService.list();
                this.loaded = true;
            }
        },
        async addPayment(payment, invoice) {
            if (!invoice || invoice.status !== 'published') throw new Error('Pembayaran hanya dapat dicatat untuk invoice diterbitkan.');
            const summary = this.paymentSummaryByInvoice(invoice);
            if (!payment.paymentDate || !payment.method?.trim() || !payment.accountId) throw new Error('Tanggal pembayaran, metode, dan rekening penerima wajib diisi.');
            if (summary.remaining <= 0) throw new Error('Invoice ini sudah lunas.');
            const amount = Number(payment.amount || 0);
            if (amount <= 0) throw new Error('Nominal pembayaran harus lebih dari Rp 0.');
            if (amount > summary.remaining) throw new Error('Nominal pembayaran melebihi sisa tagihan.');
            try {
                const record = await paymentService.record(invoice.id, { ...payment, amount });
                this.payments = [record, ...this.payments];
                return record;
            } catch (error) {
                throw new Error(error.response?.data?.errors?.amount?.[0] || error.response?.data?.message || 'Gagal mencatat pembayaran.');
            }
        },
    },
});
