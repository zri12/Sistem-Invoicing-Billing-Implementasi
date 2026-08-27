import { defineStore } from 'pinia';
import { useSettingsStore } from '@/stores/settings';

// TEMPORARY FRONTEND DEMO STATE — to be replaced by the Laravel Invoice API.
const records = [
    { id: 'inv1', number: '001/INV/RKA/VIII/26', name: 'Project Spiritra', clientId: 'k1', client: 'Graha Indonesia Telekomunika', date: '2026-08-01', dueDate: '2026-08-15', items: [{ id: 'i1', product: 'Pengembangan Website', description: 'Pembayaran Ke-2 Pelunasan Project Spiritra', price: 3000000, qty: 1 }], discount: 0, accountId: 'r1', terms: 'Silakan lakukan pembayaran ke rekening yang tertera di atas', notes: '', status: 'published' },
    { id: 'inv2', number: '002/INV/RKA/VIII/26', name: 'Aplikasi Mobile MJT', clientId: 'k2', client: 'PT Maju Jaya Teknologi', date: '2026-08-05', dueDate: '2026-08-20', items: [{ id: 'i2', product: 'Pengembangan Aplikasi Mobile', description: 'Tahap 1 - Analisis & Desain', price: 7500000, qty: 1 }, { id: 'i3', product: 'UI/UX Design', description: 'Desain UI/UX Aplikasi', price: 3000000, qty: 1 }], discount: 500000, accountId: 'r1', terms: 'Silakan lakukan pembayaran ke rekening yang tertera di atas', notes: '', status: 'published' },
    { id: 'inv3', number: '003/INV/RKA/VIII/26', name: 'Maintenance Agustus - BAS', clientId: 'k3', client: 'CV Berkah Abadi Sentosa', date: '2026-08-01', dueDate: '2026-08-10', items: [{ id: 'i4', product: 'Maintenance & Support', description: 'Maintenance bulan Agustus 2026', price: 1500000, qty: 1 }], discount: 0, accountId: 'r2', terms: '', notes: '', status: 'published' },
    { id: 'inv4', number: '004/INV/RKA/VIII/26', name: 'Website PT Digital Nusantara', clientId: 'k4', client: 'PT Digital Nusantara', date: '2026-08-10', dueDate: '2026-09-10', items: [{ id: 'i5', product: 'Pengembangan Website', description: 'Website Company Profile', price: 5000000, qty: 1 }], discount: 0, accountId: 'r1', terms: '', notes: '', status: 'draft' },
    { id: 'inv5', number: '005/INV/RKA/VII/26', name: 'Konsultasi IT - BAS', clientId: 'k3', client: 'CV Berkah Abadi Sentosa', date: '2026-07-15', dueDate: '2026-07-30', items: [{ id: 'i6', product: 'Konsultasi IT', description: '3 sesi konsultasi pengembangan sistem', price: 500000, qty: 3 }], discount: 0, accountId: 'r2', terms: '', notes: '', status: 'cancelled' },
    { id: 'inv6', number: '006/INV/RKA/VIII/26', name: 'Support Infrastruktur', clientId: 'k1', client: 'Graha Indonesia Telekomunika', date: '2026-08-22', dueDate: '2026-09-22', items: [{ id: 'i7', product: 'Cloud Infrastructure Setup', description: 'Konfigurasi cloud', price: 4000000, qty: 1 }], discount: 0, accountId: 'r1', terms: '', notes: '', status: 'draft' },
];

export const useInvoiceStore = defineStore('invoice', {
    state: () => ({ invoices: records, previewInvoice: null }),
    actions: {
        getInvoiceById(id) { return this.invoices.find((invoice) => invoice.id === id); },
        numberFor(date) { const max = Math.max(...this.invoices.map((invoice) => Number(invoice.number.split('/')[0]) || 0)); return useSettingsStore().formatNumber(max + 1, date); },
        createInvoice(invoice) { const id = `inv-${Date.now()}`; this.invoices.unshift({ ...invoice, id }); return id; },
        updateInvoice(id, invoice) { this.invoices = this.invoices.map((item) => item.id === id ? { ...item, ...invoice, number: item.number } : item); },
        cancelInvoice(id) { this.invoices = this.invoices.map((invoice) => invoice.id === id ? { ...invoice, status: 'cancelled' } : invoice); },
        setPreview(invoice) { this.previewInvoice = invoice; },
    },
});
