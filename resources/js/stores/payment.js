import { defineStore } from 'pinia';

// TEMPORARY FRONTEND DEMO STATE — the Laravel Payment API will own this data later.
const initialPayments = [
    { id: 'pay1', invoiceId: 'inv1', paymentDate: '2026-08-12', amount: 3000000, method: 'Transfer Bank', accountId: 'r1', referenceNumber: 'TRF-20260812-001', proofName: '', notes: 'Pelunasan invoice', createdBy: 'Fazri Lukman', createdAt: '2026-08-12T09:00:00' },
    { id: 'pay2', invoiceId: 'inv2', paymentDate: '2026-08-18', amount: 5000000, method: 'Transfer Bank', accountId: 'r1', referenceNumber: 'TRF-20260818-002', proofName: '', notes: 'Pembayaran DP', createdBy: 'Fazri Lukman', createdAt: '2026-08-18T09:00:00' },
];
const invoiceTotal = (invoice) => (invoice?.items || []).reduce((total, item) => total + Number(item.price || 0) * Number(item.qty || 0), 0) - Number(invoice?.discount || 0);
const todayIso = () => { const date = new Date(); const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 10); };

export const usePaymentStore = defineStore('payment', {
    state: () => ({ payments: initialPayments }),
    getters: {
        paymentsByInvoice: (state) => (invoiceId) => state.payments.filter((payment) => payment.invoiceId === invoiceId).sort((left, right) => right.paymentDate.localeCompare(left.paymentDate)),
        totalPaidByInvoice: (state) => (invoiceId) => state.payments.filter((payment) => payment.invoiceId === invoiceId).reduce((total, payment) => total + Number(payment.amount || 0), 0),
        paymentSummaryByInvoice() { return (invoice) => { const total = invoiceTotal(invoice); const totalPaid = this.totalPaidByInvoice(invoice?.id); const remaining = Math.max(total - totalPaid, 0); const status = totalPaid >= total ? 'lunas' : invoice?.dueDate && todayIso() > invoice.dueDate ? 'jatuh_tempo' : totalPaid > 0 ? 'dibayar_sebagian' : 'belum_dibayar'; return { total, totalPaid, remaining, status }; }; },
        invoiceIncomeEntries: (state) => state.payments.map((payment) => ({ source: 'invoice', paymentId: payment.id, invoiceId: payment.invoiceId, date: payment.paymentDate, amount: payment.amount, accountId: payment.accountId, description: `Pembayaran invoice ${payment.invoiceId}` })),
    },
    actions: {
        addPayment(payment, invoice) {
            if (!invoice || invoice.status !== 'published') throw new Error('Pembayaran hanya dapat dicatat untuk invoice diterbitkan.');
            const summary = this.paymentSummaryByInvoice(invoice);
            if (!payment.paymentDate || !payment.method?.trim() || !payment.accountId) throw new Error('Tanggal pembayaran, metode, dan rekening penerima wajib diisi.');
            if (summary.remaining <= 0) throw new Error('Invoice ini sudah lunas.');
            const amount = Number(payment.amount || 0);
            if (amount <= 0) throw new Error('Nominal pembayaran harus lebih dari Rp 0.');
            if (amount > summary.remaining) throw new Error('Nominal pembayaran melebihi sisa tagihan.');
            const record = { ...payment, id: `pay-${Date.now()}`, amount, createdAt: new Date().toISOString() };
            this.payments.unshift(record);
            return record;
        },
    },
});
