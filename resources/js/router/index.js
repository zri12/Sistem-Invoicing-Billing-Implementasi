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
        ...placeholders.filter(([path]) => !['dashboard', 'klien', 'vendor', 'produk-layanan', 'rekening'].includes(path)).map(([path, title]) => ({ path: `/${path}`, name: path, component: PlaceholderView, meta: appMeta(title) })),
    ],
});

// TEMPORARY FRONTEND DEMO GUARD — Vue routing is not production authorization.
router.beforeEach((to) => {
    const auth = useAuthStore();
    if (to.meta.authRequired && !auth.isAuthenticated) return { name: 'login' };
    if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'dashboard' };
});
router.afterEach(() => { document.title = 'Sistem Invoicing & Billing | DEVSPACE'; });
export default router;
