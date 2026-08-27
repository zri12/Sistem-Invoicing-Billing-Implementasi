import { createRouter, createWebHistory } from 'vue-router';
import FoundationPreview from '@/views/FoundationPreview.vue';
import PlaceholderView from '@/views/PlaceholderView.vue';
const placeholders = [['dashboard', 'Dashboard'], ['klien', 'Klien'], ['vendor', 'Vendor'], ['produk-layanan', 'Produk & Layanan'], ['rekening', 'Rekening'], ['invoice', 'Invoice'], ['billing', 'Billing'], ['pembayaran', 'Pembayaran'], ['pemasukan', 'Pemasukan'], ['pengeluaran', 'Pengeluaran'], ['laporan', 'Laporan'], ['data-perusahaan', 'Data Perusahaan'], ['template-invoice', 'Template Invoice'], ['penomoran-invoice', 'Penomoran Invoice'], ['pengguna', 'Pengguna & Hak Akses']];
const router = createRouter({ history: createWebHistory(), routes: [{ path: '/', name: 'foundation', component: FoundationPreview, meta: { title: 'Foundation Preview', section: 'Foundation', authRequired: false } }, ...placeholders.map(([path, title]) => ({ path: `/${path}`, name: path, component: PlaceholderView, meta: { title, section: 'Application', authRequired: true } }))] });
router.afterEach(() => { document.title = 'Sistem Invoicing & Billing | DEVSPACE'; });
export default router;
