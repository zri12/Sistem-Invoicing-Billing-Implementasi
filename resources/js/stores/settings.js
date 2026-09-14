import { defineStore } from 'pinia';
import settingsService from '@/services/settingsService';

let settingsRequest = null;
let invoiceDocumentRequest = null;

const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        company: { name: '', code: '', address: '', signingCity: '', phone: '', email: '', website: '', tagline: '', signerName: '', signerPosition: '', logoUrl: '', stampUrl: '', signatureUrl: '' },
        invoiceTemplate: { title: 'INVOICE', showLogo: true, showTagline: true, showTitle: true, showNumber: true, showInvoiceDate: true, showDueDate: true, showClient: true, showItems: true, showSubtotal: true, showDiscount: true, showTotal: true, showBankInfo: true, showTerms: true, showStamp: true, showSignature: true, showSignerName: true, showSignerPosition: true },
        invoiceNumbering: { documentCode: 'INV', companyCode: 'RKA', digits: 3, monthFormat: 'romawi', yearFormat: '2digit', resetPolicy: 'continuous' },
        loaded: false,
        invoiceDocumentLoaded: false,
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
        async ensure(force = false) {
            if (this.loaded && !force) return;
            if (!settingsRequest) {
                settingsRequest = Promise.all([settingsService.getCompany(), settingsService.getTemplate(), settingsService.getNumbering()])
                    .then(([company, template, numbering]) => {
                        this.company = company;
                        this.invoiceTemplate = template;
                        this.invoiceNumbering = numbering;
                        this.loaded = true;
                        this.invoiceDocumentLoaded = true;
                    })
                    .finally(() => { settingsRequest = null; });
            }
            await settingsRequest;
        },
        async ensureInvoiceDocument() {
            if (this.invoiceDocumentLoaded) return;
            if (!invoiceDocumentRequest) {
                invoiceDocumentRequest = Promise.all([settingsService.getCompany(), settingsService.getTemplate()])
                    .then(([company, template]) => { this.company = company; this.invoiceTemplate = template; this.invoiceDocumentLoaded = true; })
                    .finally(() => { invoiceDocumentRequest = null; });
            }
            await invoiceDocumentRequest;
        },
        async saveCompany(value, files) { this.company = await settingsService.saveCompany(value, files); this.invoiceDocumentLoaded = true; },
        async saveTemplate(value) { this.invoiceTemplate = await settingsService.saveTemplate(value); this.invoiceDocumentLoaded = true; },
        async saveNumbering(value) { this.invoiceNumbering = await settingsService.saveNumbering(value); },
    },
});
