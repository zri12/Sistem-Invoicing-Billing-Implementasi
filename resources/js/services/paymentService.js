import api from '@/services/api';

const methodFromApi = { transfer: 'Transfer Bank', cash: 'Kas', cheque: 'Cek', qris: 'QRIS' };

export const paymentFromApi = (p) => ({
    id: p.id,
    invoiceId: p.invoice_id,
    paymentDate: p.payment_date,
    amount: Number(p.amount),
    method: methodFromApi[p.method] || p.method,
    accountId: p.account_id,
    accountName: p.account?.name || '',
    invoiceNumber: p.invoice?.invoice_number || '',
    clientName: p.invoice?.client?.name || '',
    referenceNumber: p.reference_number || '',
    proofName: p.proof_url ? p.proof_url.split('/').pop() : '',
    notes: p.notes || '',
    createdBy: p.created_by,
    createdAt: p.created_at,
});

const methodToApi = { 'Transfer Bank': 'transfer', Kas: 'cash', Cek: 'cheque', QRIS: 'qris' };

export default {
    async list() {
        const { data } = await api.get('/payments', { params: { per_page: 200 } });
        return data.data.items.map(paymentFromApi);
    },
    async record(invoiceId, payment) {
        const form = new FormData();
        form.append('payment_date', payment.paymentDate);
        form.append('amount', payment.amount);
        form.append('method', methodToApi[payment.method] || 'transfer');
        form.append('account_id', payment.accountId);
        if (payment.referenceNumber) form.append('reference_number', payment.referenceNumber);
        if (payment.notes) form.append('notes', payment.notes);
        if (payment.proofFile) form.append('proof', payment.proofFile);

        const { data } = await api.post(`/invoices/${invoiceId}/payments`, form);
        return paymentFromApi(data.data);
    },
};
