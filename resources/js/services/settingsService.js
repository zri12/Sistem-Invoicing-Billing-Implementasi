import api from '@/services/api';

const companyFromApi = (c) => ({
    name: c.name, code: c.code || '', address: c.address || '', signingCity: c.signing_city || '',
    phone: c.phone || '', email: c.email || '', website: c.website || '', tagline: c.tagline || '',
    signerName: c.signer_name || '', signerPosition: c.signer_title || '',
    logoUrl: c.logo_url || '', stampUrl: c.stamp_url || '', signatureUrl: c.signature_url || '',
});

const templateFromApi = (t) => ({
    title: t.title, showLogo: t.show_logo, showTagline: t.show_tagline, showTitle: t.show_title,
    showNumber: t.show_number, showInvoiceDate: t.show_invoice_date, showDueDate: t.show_due_date,
    showClient: t.show_client, showItems: t.show_items, showSubtotal: t.show_subtotal,
    showDiscount: t.show_discount, showTotal: t.show_total, showBankInfo: t.show_bank_info,
    showTerms: t.show_terms, showStamp: t.show_stamp, showSignature: t.show_signature,
    showSignerName: t.show_signer_name, showSignerPosition: t.show_signer_position,
});
const templateToApi = (v) => ({
    title: v.title, show_logo: v.showLogo, show_tagline: v.showTagline, show_title: v.showTitle,
    show_number: v.showNumber, show_invoice_date: v.showInvoiceDate, show_due_date: v.showDueDate,
    show_client: v.showClient, show_items: v.showItems, show_subtotal: v.showSubtotal,
    show_discount: v.showDiscount, show_total: v.showTotal, show_bank_info: v.showBankInfo,
    show_terms: v.showTerms, show_stamp: v.showStamp, show_signature: v.showSignature,
    show_signer_name: v.showSignerName, show_signer_position: v.showSignerPosition,
});

const numberingFromApi = (n) => ({
    documentCode: n.document_code, companyCode: n.company_code, digits: n.digits,
    monthFormat: n.month_format, yearFormat: n.year_format, resetPolicy: n.reset_rule,
});
const numberingToApi = (v) => ({
    document_code: v.documentCode, company_code: v.companyCode, digits: Number(v.digits) || 3,
    month_format: v.monthFormat, year_format: v.yearFormat,
});

export default {
    async getCompany() { const { data } = await api.get('/company'); return companyFromApi(data.data); },
    async saveCompany(form, files = {}) {
        const body = new FormData();
        body.append('_method', 'PUT');
        Object.entries({
            name: form.name, code: form.code, address: form.address, signing_city: form.signingCity,
            phone: form.phone, email: form.email, website: form.website, tagline: form.tagline,
            signer_name: form.signerName, signer_title: form.signerPosition,
        }).forEach(([key, value]) => body.append(key, value ?? ''));
        if (files.logo) body.append('logo', files.logo);
        if (files.stamp) body.append('stamp', files.stamp);
        if (files.signature) body.append('signature', files.signature);
        const { data } = await api.post('/company', body);
        return companyFromApi(data.data);
    },
    async getTemplate() { const { data } = await api.get('/settings/invoice-template'); return templateFromApi(data.data); },
    async saveTemplate(form) { const { data } = await api.put('/settings/invoice-template', templateToApi(form)); return templateFromApi(data.data); },
    async getNumbering() { const { data } = await api.get('/settings/invoice-numbering'); return numberingFromApi(data.data); },
    async saveNumbering(form) { const { data } = await api.put('/settings/invoice-numbering', numberingToApi(form)); return numberingFromApi(data.data); },
};
