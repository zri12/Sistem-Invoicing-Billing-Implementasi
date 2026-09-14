import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useMasterDataStore } from '@/stores/masterData';
import { useFinanceStore } from '@/stores/finance';
import { useInvoiceStore } from '@/stores/invoice';
import { usePaymentStore } from '@/stores/payment';
import { useSettingsStore } from '@/stores/settings';
import { useUsersStore } from '@/stores/users';
import Login from '@/views/auth/Login.vue';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import Clients from '@/views/master-data/Clients.vue';
import Vendors from '@/views/master-data/Vendors.vue';
import Products from '@/views/master-data/Products.vue';
import Accounts from '@/views/master-data/Accounts.vue';
import InvoiceList from '@/views/invoice/InvoiceList.vue';
import InvoiceForm from '@/views/invoice/InvoiceForm.vue';
import InvoiceDetail from '@/views/invoice/InvoiceDetail.vue';
import InvoicePreview from '@/views/invoice/InvoicePreview.vue';
import BillingList from '@/views/billing/BillingList.vue';
import BillingDetail from '@/views/billing/BillingDetail.vue';
import PaymentList from '@/views/payment/PaymentList.vue';
import IncomeList from '@/views/finance/IncomeList.vue';
import ExpenseList from '@/views/finance/ExpenseList.vue';
import Reports from '@/views/reports/Reports.vue';
import Company from '@/views/settings/Company.vue';
import Template from '@/views/settings/Template.vue';
import Numbering from '@/views/settings/Numbering.vue';
import Users from '@/views/settings/Users.vue';

const appMeta = (title) => ({ title, section: 'Application', authRequired: true, layout: 'app' });

const preloadPageData = async (to) => {
    const masterData = useMasterDataStore();
    const finance = useFinanceStore();
    const invoices = useInvoiceStore();
    const payments = usePaymentStore();
    const settings = useSettingsStore();
    const users = useUsersStore();
    const loaders = {
        dashboard: () => Promise.all([invoices.ensure(), payments.ensure(), finance.ensure()]),
        klien: () => masterData.ensure('client'),
        vendor: () => masterData.ensure('vendor'),
        'produk-layanan': () => masterData.ensure('product'),
        rekening: () => masterData.ensure('account'),
        invoice: () => Promise.all([invoices.ensure(), payments.ensure(), masterData.ensureAll()]),
        'invoice-create': () => masterData.ensureAll(),
        'invoice-edit': () => Promise.all([invoices.fetchOne(to.params.id), masterData.ensureAll()]),
        'invoice-detail': () => Promise.all([invoices.fetchOne(to.params.id), payments.ensure(), masterData.ensureAll()]),
        'invoice-preview': () => Promise.all([invoices.fetchOne(to.params.id), settings.ensureInvoiceDocument()]),
        billing: () => Promise.all([invoices.ensure(), payments.ensure()]),
        'billing-detail': () => Promise.all([invoices.fetchOne(to.params.invoiceId), payments.ensure()]),
        pembayaran: () => payments.ensure(),
        pemasukan: () => Promise.all([finance.ensureIncomes(), masterData.ensureAll()]),
        pengeluaran: () => Promise.all([finance.ensureExpenses(), masterData.ensureAll()]),
        laporan: () => Promise.all([invoices.ensure(), payments.ensure(), finance.ensure(), masterData.ensureAll()]),
        'data-perusahaan': () => settings.ensure(),
        'template-invoice': () => Promise.all([settings.ensure(), invoices.ensure(), masterData.ensureAll()]),
        'penomoran-invoice': () => settings.ensure(),
        pengguna: () => users.ensure(),
    };

    if (loaders[to.name]) await loaders[to.name]();
};
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', name: 'login', component: Login, meta: { title: 'Login', guestOnly: true, layout: 'auth' } },
        { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: appMeta('Dashboard') },
        { path: '/klien', name: 'klien', component: Clients, meta: { ...appMeta('Klien'), masterDataKind: 'client' } },
        { path: '/vendor', name: 'vendor', component: Vendors, meta: { ...appMeta('Vendor'), masterDataKind: 'vendor' } },
        { path: '/produk-layanan', name: 'produk-layanan', component: Products, meta: { ...appMeta('Produk & Layanan'), masterDataKind: 'product' } },
        { path: '/rekening', name: 'rekening', component: Accounts, meta: { ...appMeta('Rekening'), masterDataKind: 'account' } },
        { path: '/invoice', name: 'invoice', component: InvoiceList, meta: appMeta('Invoice') },
        { path: '/invoice/create', name: 'invoice-create', component: InvoiceForm, meta: { ...appMeta('Buat Invoice'), adminOnly: true } },
        { path: '/invoice/:id/edit', name: 'invoice-edit', component: InvoiceForm, meta: { ...appMeta('Edit Invoice'), adminOnly: true } },
        { path: '/invoice/:id/preview', name: 'invoice-preview', component: InvoicePreview, meta: { ...appMeta('Preview Invoice'), layout: 'preview' } },
        { path: '/invoice/:id', name: 'invoice-detail', component: InvoiceDetail, meta: appMeta('Detail Invoice') },
        { path: '/billing', name: 'billing', component: BillingList, meta: appMeta('Billing') },
        { path: '/billing/:invoiceId', name: 'billing-detail', component: BillingDetail, meta: appMeta('Detail Billing') },
        { path: '/pembayaran', name: 'pembayaran', component: PaymentList, meta: appMeta('Pembayaran') },
        { path: '/pemasukan', name: 'pemasukan', component: IncomeList, meta: appMeta('Pemasukan') },
        { path: '/pengeluaran', name: 'pengeluaran', component: ExpenseList, meta: appMeta('Pengeluaran') },
        { path: '/laporan', name: 'laporan', component: Reports, meta: appMeta('Laporan') },
        { path: '/data-perusahaan', name: 'data-perusahaan', component: Company, meta: appMeta('Data Perusahaan') },
        { path: '/template-invoice', name: 'template-invoice', component: Template, meta: appMeta('Template Invoice') },
        { path: '/penomoran-invoice', name: 'penomoran-invoice', component: Numbering, meta: appMeta('Penomoran Invoice') },
        { path: '/pengguna', name: 'pengguna', component: Users, meta: { ...appMeta('Pengguna & Hak Akses'), adminOnly: true } },
        { path: '/:pathMatch(.*)*', redirect: () => useAuthStore().isAuthenticated ? '/dashboard' : '/login' },
    ],
});

router.beforeEach(async (to) => {
    const auth = useAuthStore();
    // Vue Router resolves its first navigation as soon as the router is
    // installed, before app.js's async session check can finish — so on a
    // hard refresh this guard would otherwise see a not-yet-hydrated store
    // and bounce straight to /login. Block that first navigation on the
    // session check instead of racing it.
    const restoringSession = !auth.initialized;
    if (restoringSession) await auth.fetchCurrentUser();
    if (to.meta.authRequired && !auth.isAuthenticated) return { name: 'login' };
    if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'dashboard' };
    if (to.meta.adminOnly && auth.role !== 'admin') return { name: to.name === 'pengguna' ? 'dashboard' : 'invoice' };
    // Pada hard refresh, tunggu hanya data halaman tujuan agar tidak ada angka
    // nol palsu. Setelah login, bootstrap sudah mengisi seluruh store sehingga
    // perpindahan menu tidak lagi menunggu banyak endpoint.
    if (to.meta.authRequired && restoringSession) {
        try {
            await preloadPageData(to);
        } catch (error) {
            console.error('Gagal menyiapkan data halaman.', error);
        }
        return;
    }
    // Data dipanaskan di latar belakang. Navigasi tidak boleh menunggu API;
    // menu dan tombol Kembali harus berpindah seketika.
    void preloadPageData(to).catch((error) => {
        console.error('Gagal memuat data halaman.', error);
    });
});
router.afterEach(() => { document.title = 'Sistem Invoicing & Billing | DEVSPACE'; });
export default router;
