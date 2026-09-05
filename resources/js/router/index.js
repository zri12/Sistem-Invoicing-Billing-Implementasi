import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import FoundationPreview from '@/views/FoundationPreview.vue';
import Login from '@/views/auth/Login.vue';
import PlaceholderView from '@/views/PlaceholderView.vue';
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

const placeholders = [['dashboard', 'Dashboard'], ['klien', 'Klien'], ['vendor', 'Vendor'], ['produk-layanan', 'Produk & Layanan'], ['rekening', 'Rekening'], ['invoice', 'Invoice'], ['billing', 'Billing'], ['pembayaran', 'Pembayaran'], ['pemasukan', 'Pemasukan'], ['pengeluaran', 'Pengeluaran'], ['laporan', 'Laporan'], ['data-perusahaan', 'Data Perusahaan'], ['template-invoice', 'Template Invoice'], ['penomoran-invoice', 'Penomoran Invoice'], ['pengguna', 'Pengguna & Hak Akses']];

const appMeta = (title) => ({ title, section: 'Application', authRequired: true, layout: 'app' });
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', name: 'login', component: Login, meta: { title: 'Login', guestOnly: true, layout: 'auth' } },
        { path: '/foundation', name: 'foundation', component: FoundationPreview, meta: appMeta('Foundation Preview') },
        { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: appMeta('Dashboard') },
        { path: '/klien', name: 'klien', component: Clients, meta: appMeta('Klien') },
        { path: '/vendor', name: 'vendor', component: Vendors, meta: appMeta('Vendor') },
        { path: '/produk-layanan', name: 'produk-layanan', component: Products, meta: appMeta('Produk & Layanan') },
        { path: '/rekening', name: 'rekening', component: Accounts, meta: appMeta('Rekening') },
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
        ...placeholders.filter(([path]) => !['dashboard', 'klien', 'vendor', 'produk-layanan', 'rekening', 'invoice', 'billing', 'pembayaran', 'pemasukan', 'pengeluaran', 'laporan', 'data-perusahaan', 'template-invoice', 'penomoran-invoice', 'pengguna'].includes(path)).map(([path, title]) => ({ path: `/${path}`, name: path, component: PlaceholderView, meta: appMeta(title) })),
        { path: '/:pathMatch(.*)*', redirect: () => useAuthStore().isAuthenticated ? '/dashboard' : '/login' },
    ],
});

// TEMPORARY FRONTEND DEMO GUARD — Vue routing is not production authorization.
// FRONTEND DEMO GUARD ONLY. FINAL AUTHORIZATION MUST BE ENFORCED BY LARAVEL BACKEND.
router.beforeEach(async (to) => {
    const auth = useAuthStore();
    // Vue Router resolves its first navigation as soon as the router is
    // installed, before app.js's async session check can finish — so on a
    // hard refresh this guard would otherwise see a not-yet-hydrated store
    // and bounce straight to /login. Block that first navigation on the
    // session check instead of racing it.
    if (!auth.initialized) await auth.fetchCurrentUser();
    if (to.meta.authRequired && !auth.isAuthenticated) return { name: 'login' };
    if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'dashboard' };
    if (to.meta.adminOnly && auth.role !== 'admin') return { name: to.name === 'pengguna' ? 'dashboard' : 'invoice' };
});
router.afterEach(() => { document.title = 'Sistem Invoicing & Billing | DEVSPACE'; });
export default router;
