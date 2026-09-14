import { defineStore } from 'pinia';
import invoiceService from '@/services/invoiceService';

let invoiceListRequest = null;
const invoiceDetailRequests = new Map();

export const useInvoiceStore = defineStore('invoice', {
    state: () => ({ invoices: [], loaded: false, detailedInvoiceIds: [] }),
    getters: {
        hasInvoiceDetails: (state) => (id) => state.detailedInvoiceIds.includes(String(id)),
    },
    actions: {
        async ensure() {
            if (this.loaded) return;
            if (!invoiceListRequest) {
                invoiceListRequest = invoiceService.list()
                    .then((invoices) => { this.invoices = invoices; this.loaded = true; })
                    .finally(() => { invoiceListRequest = null; });
            }
            await invoiceListRequest;
        },
        getInvoiceById(id) { return this.invoices.find((invoice) => String(invoice.id) === String(id)); },
        async fetchOne(id, force = false) {
            const key = String(id);
            const cached = this.getInvoiceById(key);
            if (!force && cached && this.hasInvoiceDetails(key)) return cached;

            if (!invoiceDetailRequests.has(key)) {
                invoiceDetailRequests.set(key, invoiceService.get(id)
                    .then((invoice) => {
                        this.invoices = [invoice, ...this.invoices.filter((item) => item.id !== invoice.id)];
                        if (!this.hasInvoiceDetails(key)) this.detailedInvoiceIds = [...this.detailedInvoiceIds, key];
                        return invoice;
                    })
                    .finally(() => { invoiceDetailRequests.delete(key); }));
            }

            return invoiceDetailRequests.get(key);
        },
        async createInvoice(invoice, status = 'draft') {
            const created = await invoiceService.create(invoice, status);
            this.invoices = [created, ...this.invoices];
            this.detailedInvoiceIds = [...this.detailedInvoiceIds.filter((id) => id !== String(created.id)), String(created.id)];
            return created.id;
        },
        async updateInvoice(id, invoice) {
            const updated = await invoiceService.update(id, invoice);
            this.invoices = this.invoices.map((item) => item.id === updated.id ? updated : item);
            this.detailedInvoiceIds = [...this.detailedInvoiceIds.filter((itemId) => itemId !== String(updated.id)), String(updated.id)];
            return updated;
        },
        async cancelInvoice(id) {
            const updated = await invoiceService.cancel(id);
            this.invoices = this.invoices.map((item) => item.id === updated.id ? updated : item);
            return updated;
        },
        async publishInvoice(id) {
            const updated = await invoiceService.publish(id);
            this.invoices = this.invoices.map((item) => item.id === updated.id ? updated : item);
            return updated;
        },
        downloadPdf(id, fallbackFilename) { return invoiceService.downloadPdf(id, fallbackFilename); },
    },
});
