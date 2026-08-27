import { defineStore } from 'pinia';

// TEMPORARY FRONTEND DEMO STATE — to be replaced by the Laravel Settings API.
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        company: { name: 'PT. Ruang Kreasi Aplikasi', code: 'RKA', address: 'Jl. Melong No.123, Cimahi, Jawa Barat 40534', phone: '(022) 12345678', email: 'info@ruangkreasi.co.id', website: 'www.ruangkreasi.co.id', tagline: 'Professional & Valuable Digital Transformation', signerName: 'Andri Firmansyah', signerPosition: 'Admin Keuangan', logoUrl: '/images/invoice/devspace-invoice-logo.png', stampUrl: '', signatureUrl: '' },
        invoiceTemplate: { title: 'INVOICE', showLogo: true, showTagline: true, showTitle: true, showNumber: true, showInvoiceDate: true, showDueDate: true, showClient: true, showItems: true, showSubtotal: true, showDiscount: true, showTotal: true, showBankInfo: true, showTerms: true, showStamp: true, showSignature: true, showSignerName: true, showSignerPosition: true },
        invoiceNumbering: { documentCode: 'INV', companyCode: 'RKA', digits: 3, monthFormat: 'romawi', yearFormat: '2digit', resetPolicy: 'belum' },
    }),
    getters: {
        formatNumber: (state) => (sequence, date) => {
            const value = new Date(`${date}T00:00:00`);
            const month = state.invoiceNumbering.monthFormat === 'romawi' ? roman[value.getMonth()] : String(value.getMonth() + 1).padStart(2, '0');
            const year = state.invoiceNumbering.yearFormat === '2digit' ? String(value.getFullYear()).slice(-2) : String(value.getFullYear());
            return `${String(sequence).padStart(Number(state.invoiceNumbering.digits) || 3, '0')}/${state.invoiceNumbering.documentCode}/${state.invoiceNumbering.companyCode}/${month}/${year}`;
        },
    },
    actions: {
        saveCompany(value) { this.company = { ...this.company, ...value }; },
        saveTemplate(value) { this.invoiceTemplate = { ...this.invoiceTemplate, ...value }; },
        saveNumbering(value) { this.invoiceNumbering = { ...this.invoiceNumbering, ...value }; },
    },
});
