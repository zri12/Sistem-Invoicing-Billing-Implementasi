import { defineStore } from 'pinia';
import invoiceService from '@/services/invoiceService';

export const useInvoiceStore = defineStore('invoice', {
    state: () => ({ invoices: [], loaded: false, previewInvoice: null }),
    actions: {
        async ensure() {
            if (!this.loaded) {
                this.invoices = await invoiceService.list();
                this.loaded = true;
            }
        },
        getInvoiceById(id) { return this.invoices.find((invoice) => String(invoice.id) === String(id)); },
        async fetchOne(id) {
            const invoice = await invoiceService.get(id);
            this.invoices = [invoice, ...this.invoices.filter((item) => item.id !== invoice.id)];
            return invoice;
        },
        async createInvoice(invoice, status = 'draft') {
            const created = await invoiceService.create(invoice, status);
            this.invoices = [created, ...this.invoices];
            return created.id;
        },
        async updateInvoice(id, invoice) {
            const updated = await invoiceService.update(id, invoice);
            this.invoices = this.invoices.map((item) => item.id === updated.id ? updated : item);
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
        setPreview(invoice) { this.previewInvoice = invoice; },
        downloadPdf(id, fallbackFilename) { return invoiceService.downloadPdf(id, fallbackFilename); },
    },
});
