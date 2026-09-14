import api from '@/services/api';

export const invoiceFromApi = (inv) => ({
    id: inv.id,
    number: inv.invoice_number,
    name: inv.invoice_name,
    clientId: inv.client_id,
    client: inv.client?.name || '',
    clientDetails: inv.client ? {
        id: inv.client.id, nama: inv.client.name, alamat: inv.client.address,
        telepon: inv.client.phone, email: inv.client.email,
    } : null,
    date: inv.invoice_date,
    dueDate: inv.due_date,
    items: (inv.items || []).map((item) => ({
        id: item.id,
        productServiceId: item.product_service_id,
        product: item.product_name || '',
        description: item.description,
        price: Number(item.price),
        qty: Number(item.qty),
    })),
    subtotal: Number(inv.subtotal || 0),
    discount: Number(inv.discount || 0),
    total: Number(inv.total || 0),
    accountId: inv.payment_account_id,
    accountDetails: inv.payment_account ? {
        id: inv.payment_account.id, nama: inv.payment_account.name,
        nomor: inv.payment_account.account_number, atasNama: inv.payment_account.account_holder,
        cabang: inv.payment_account.branch,
    } : null,
    terms: inv.payment_terms || '',
    notes: inv.invoice_notes || '',
    status: inv.document_status,
});

const toApi = (form, status) => ({
    invoice_name: form.name,
    client_id: form.clientId,
    invoice_date: form.date,
    due_date: form.dueDate,
    payment_account_id: form.accountId,
    discount: Number(form.discount) || 0,
    payment_terms: form.terms || null,
    invoice_notes: form.notes || null,
    ...(status ? { document_status: status } : {}),
    items: form.items.map((item) => ({
        product_service_id: item.productServiceId || null,
        description: item.description,
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 0,
    })),
});

export default {
    async list() {
        const { data } = await api.get('/invoices', { params: { per_page: 200 } });
        return data.data.items.map(invoiceFromApi);
    },
    async get(id) {
        const { data } = await api.get(`/invoices/${id}`);
        return invoiceFromApi(data.data);
    },
    async create(form, status) {
        const { data } = await api.post('/invoices', toApi(form, status));
        return invoiceFromApi(data.data);
    },
    async update(id, form) {
        const { data } = await api.put(`/invoices/${id}`, toApi(form));
        return invoiceFromApi(data.data);
    },
    async cancel(id) {
        const { data } = await api.post(`/invoices/${id}/cancel`);
        return invoiceFromApi(data.data);
    },
    async publish(id) {
        const { data } = await api.post(`/invoices/${id}/publish`);
        return invoiceFromApi(data.data);
    },
    async downloadPdf(id, fallbackFilename) {
        const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
        const disposition = response.headers['content-disposition'] || '';
        const filename = disposition.match(/filename="?([^"]+)"?/)?.[1] || fallbackFilename || `invoice-${id}.pdf`;
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    },
};
