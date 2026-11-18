// Run against the disposable browser-testing.sqlite server, never live data.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.BROWSER_TEST_URL || 'http://127.0.0.1:8018';
if (new URL(base).port !== '8018') throw new Error('Use the isolated browser test server on port 8018.');
const output = path.resolve('storage/app/browser-test-results');
fs.mkdirSync(output, { recursive: true });
const results = [];
let page;
async function step(name, run) {
    if (process.env.BROWSER_TEST_MATCH && !/login with CSRF/.test(name)
        && !new RegExp(process.env.BROWSER_TEST_MATCH).test(name)) return;
    try { await run(); results.push({ name, passed: true }); console.log('PASS', name); }
    catch (error) {
        results.push({ name, passed: false, error: error.message });
        console.log('FAIL', name, error.message);
        await page.screenshot({ path: path.join(output, `failure-${results.length}.png`), fullPage: true }).catch(() => {});
    }
}
async function go(route) {
    await page.goto(base + route);
    await page.waitForLoadState('networkidle');
}
async function saveRequest(action, endpoint, status = 200) {
    const responsePromise = page.waitForResponse(r => r.url().includes(endpoint) && r.request().method() !== 'GET');
    await action();
    const response = await responsePromise;
    assert.equal(response.status(), status, (await response.text()).slice(0, 1200));
    await page.waitForLoadState('networkidle');
    return response.json();
}
async function images() {
    const state = await page.locator('img').evaluateAll(imgs => imgs.map(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
    assert(state.length > 0, 'Expected images on the page');
    assert.deepEqual(state.filter(i => !i.ok), [], 'Broken images: ' + JSON.stringify(state));
}

async function downloadPdf(role) {
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Simpan PDF', exact: true }).click();
    const download = await downloaded;
    const file = path.join(output, role + '-invoice.pdf');
    await download.saveAs(file);
    assert.equal(fs.readFileSync(file).subarray(0, 5).toString(), '%PDF-');
}

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: process.env.BROWSER_HEADED !== '1', slowMo: process.env.BROWSER_HEADED === '1' ? 100 : 0 });
    for (const role of ['admin', 'manager']) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, timezoneId: 'Asia/Jakarta' });
        await context.clock.setFixedTime(new Date('2026-11-17T05:00:00Z'));
        page = await context.newPage();
        page.setDefaultTimeout(30000);
        const errors = [], serverErrors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('response', r => { if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`); });
        await step(`${role}: login with CSRF enabled`, async () => {
            await go('/login');
            await page.getByLabel('Username').fill('browser-' + role);
            await page.locator('input[type=password]').fill('Browser-test-123!');
            await saveRequest(() => page.getByRole('button', { name: 'Masuk', exact: true }).click(), '/api/login');
            await page.waitForURL('**/dashboard');
        });
        const routes = [
            ['/dashboard', 'Dashboard'], ['/klien', 'Klien'], ['/vendor', 'Vendor'],
            ['/produk-layanan', 'Produk & Layanan'], ['/rekening', 'Rekening'],
            ['/invoice', 'Invoice'], ['/billing', 'Billing'], ['/pembayaran', 'Pembayaran'],
            ['/pemasukan', 'Pemasukan'], ['/pengeluaran', 'Pengeluaran'], ['/laporan', 'Laporan'],
            ['/data-perusahaan', 'Data Perusahaan'], ['/template-invoice', 'Template Invoice'],
            ['/penomoran-invoice', 'Penomoran Invoice'],
            ...(role === 'admin' ? [['/pengguna', 'Pengguna & Hak Akses']] : []),
        ];
        for (const [route, title] of routes) await step(`${role}: ${route} and refresh`, async () => {
            await go(route);
            assert(await page.getByRole('heading', { name: title, exact: true }).isVisible());
            if (route === '/data-perusahaan' || route === '/template-invoice') await images();
            if (role === 'manager') {
                assert.equal(await page.getByRole('button', { name: /^(Tambah|Simpan Perubahan|Simpan Template|Buat Invoice|Catat Pembayaran)/ }).count(), 0);
            }
        });
        if (role === 'admin') {
            for (const [route, button, field, endpoint] of [
                ['/klien', 'Tambah Klien', 'Nama Klien / Perusahaan', '/api/clients'],
                ['/vendor', 'Tambah Vendor', 'Nama Vendor', '/api/vendors'],
                ['/produk-layanan', 'Tambah Produk / Layanan', 'Nama Produk / Layanan', '/api/products-services'],
                ['/rekening', 'Tambah Rekening', 'Nama Bank / Kas', '/api/accounts'],
            ]) await step(`admin: create, edit, search, status ${route}`, async () => {
                await go(route);
                await page.getByRole('button', { name: button, exact: true }).click();
                const dialog = page.getByRole('dialog');
                const name = 'E2E ' + route.slice(1);
                await dialog.getByLabel(field).fill(name);
                if (route === '/produk-layanan') await dialog.getByLabel('Harga Awal (Rp)').fill('250000');
                await saveRequest(() => dialog.getByRole('button', { name: 'Simpan', exact: true }).click(), endpoint, 201);
                await page.getByPlaceholder(/^Cari/).fill(name);
                assert.equal(await page.locator('tbody tr').count(), 1);
                await page.getByRole('button', { name: 'Aksi ' + name, exact: true }).click();
                await page.getByRole('button', { name: 'Edit', exact: true }).click();
                await dialog.getByLabel(field).fill(name + ' Updated');
                await saveRequest(() => dialog.getByRole('button', { name: 'Simpan', exact: true }).click(), endpoint);
                await page.getByRole('button', { name: 'Aksi ' + name + ' Updated', exact: true }).click();
                await page.getByRole('button', { name: 'Nonaktifkan', exact: true }).click();
                await saveRequest(() => page.getByRole('dialog').getByRole('button', { name: 'Nonaktifkan', exact: true }).click(), endpoint);
                assert(await page.locator('tbody').getByText('Nonaktif', { exact: true }).isVisible());
            });
            await step('admin: company upload, save after login, reload images', async () => {
                await go('/data-perusahaan');
                const source = path.resolve('storage/app/browser-test-results/fixtures/logo.png');
                assert(fs.existsSync(source), 'No PNG fixture');
                for (const input of await page.locator('input[type=file]').all()) await input.setInputFiles(source);
                await saveRequest(() => page.getByRole('button', { name: 'Simpan Perubahan', exact: true }).click(), '/api/company');
                await page.reload(); await page.waitForLoadState('networkidle'); await images();
                await page.screenshot({ path: path.join(output, 'admin-company.png'), fullPage: true });
            });
            for (const route of ['/template-invoice', '/penomoran-invoice']) await step('admin: save ' + route, async () => {
                await go(route);
                await saveRequest(() => page.getByRole('button', { name: /Simpan/ }).click(), route === '/template-invoice' ? '/api/settings/invoice-template' : '/api/settings/invoice-numbering');
            });
            await step('admin: users create and edit', async () => {
                await go('/pengguna');
                await page.getByRole('button', { name: 'Tambah Pengguna', exact: true }).click();
                const d = page.getByRole('dialog');
                await d.getByLabel('Nama Lengkap').fill('E2E Test User');
                await d.getByLabel('Username', { exact: false }).fill('e2e-test-user');
                await d.getByLabel('Password', { exact: false }).fill('Browser-test-123!');
                await d.getByLabel('Role', { exact: true }).selectOption('manager');
                await saveRequest(() => d.getByRole('button', { name: 'Simpan', exact: true }).click(), '/api/users', 201);
                await page.getByRole('button', { name: 'Aksi E2E Test User', exact: true }).click();
                await page.getByRole('button', { name: 'Edit', exact: true }).click();
                await d.getByLabel('Nama Lengkap').fill('E2E User Updated');
                await saveRequest(() => d.getByRole('button', { name: 'Simpan', exact: true }).click(), '/api/users');
            });
            await step('admin: invoice create, edit, publish, preview, PDF', async () => {
                await go('/invoice/create');
                await page.getByLabel('Nama Invoice').fill('E2E Invoice');
                await page.getByLabel('Klien', { exact: false }).selectOption({ label: 'Browser Test Client' });
                await page.getByLabel('Jatuh Tempo').fill('2026-12-31');
                await page.getByLabel('Rekening Penerima').selectOption({ index: 1 });
                await page.locator('select').last().selectOption({ label: 'Browser Test Service' });
                await saveRequest(() => page.getByRole('button', { name: 'Simpan Draft', exact: true }).click(), '/api/invoices', 201);
                await page.waitForURL(/\/invoice\/\d+$/);
                const detail = new URL(page.url()).pathname;
                await go(detail + '/edit');
                await page.getByLabel('Nama Invoice').fill('E2E Invoice Updated');
                await saveRequest(() => page.getByRole('button', { name: 'Simpan Perubahan', exact: true }).click(), '/api/invoices/');
                await page.waitForURL(base + detail);
                await saveRequest(() => page.getByRole('button', { name: 'Terbitkan', exact: true }).click(), '/publish');
                assert(await page.getByText('Diterbitkan', { exact: true }).isVisible());
                await go(detail + '/preview'); await images();
                await page.screenshot({ path: path.join(output, 'admin-invoice-preview.png'), fullPage: true });
                await downloadPdf(role);
                await go(detail);
                await page.getByRole('button', { name: 'Batalkan', exact: true }).click();
                await saveRequest(() => page.getByRole('dialog').getByRole('button', { name: 'Batalkan', exact: true }).click(), '/cancel');
                assert(await page.getByText('Dibatalkan', { exact: true }).isVisible());
            });
            await step('admin: partial and final payment via form', async () => {
                await go('/invoice/1');
                for (const amount of ['40000', '60000']) {
                    await page.getByRole('button', { name: 'Catat Pembayaran', exact: true }).click();
                    await page.getByRole('dialog').getByLabel('Nominal (Rp)').fill(amount);
                    await saveRequest(() => page.getByRole('button', { name: 'Simpan Pembayaran', exact: true }).click(), '/api/invoices/1/payments', 201);
                }
                assert(await page.getByText('Lunas', { exact: true }).first().isVisible());
            });
            for (const kind of ['pemasukan', 'pengeluaran']) await step(`admin: add and edit ${kind}`, async () => {
                await go('/' + kind);
                await page.getByRole('button', { name: 'Tambah ' + (kind === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'), exact: true }).click();
                const d = page.getByRole('dialog');
                await d.getByLabel('Nominal (Rp)').fill('15000');
                if (kind === 'pemasukan') {
                    await d.getByLabel('Kategori').fill('Pendapatan Lainnya');
                    await d.getByLabel('Rekening', { exact: true }).selectOption({ index: 1 });
                } else {
                    await d.getByLabel('Kategori').selectOption('Operasional');
                    await d.getByLabel('Rekening Sumber').selectOption({ index: 1 });
                }
                await d.getByLabel('Keterangan').fill('E2E ' + kind);
                const endpoint = kind === 'pemasukan' ? '/api/incomes' : '/api/expenses';
                await saveRequest(() => d.getByRole('button', { name: 'Simpan', exact: true }).click(), endpoint, 201);
                const row = page.locator('tbody tr').filter({ hasText: 'E2E ' + kind });
                await row.getByRole('button', { name: 'Edit', exact: true }).click();
                await d.getByLabel('Keterangan').fill('E2E ' + kind + ' Updated');
                await saveRequest(() => d.getByRole('button', { name: 'Simpan', exact: true }).click(), endpoint);
            });
        } else {
            await step('manager: restricted routes redirect', async () => {
                await go('/pengguna'); assert(new URL(page.url()).pathname === '/dashboard');
                await go('/invoice/create'); assert(new URL(page.url()).pathname === '/invoice');
                await go('/invoice/1/edit'); assert(new URL(page.url()).pathname === '/invoice');
            });
            await step('manager: invoice preview, images, PDF and print', async () => {
                await go('/invoice/1/preview'); await images();
                await page.screenshot({ path: path.join(output, 'manager-invoice-preview.png'), fullPage: true });
                await downloadPdf(role);
                const response = await context.request.get(base + '/invoice/1/print');
                assert.equal(response.status(), 200);
                assert.equal((await response.body()).subarray(0, 5).toString(), '%PDF-');
            });
        }
        await step(role + ': all report tabs and filters', async () => {
            await go('/laporan');
            await page.getByLabel('Tanggal Awal').fill('2026-01-01');
            for (const name of ['Invoice', 'Pembayaran', 'Pemasukan', 'Pengeluaran', 'Keuangan / Debit & Kredit']) {
                await page.locator('.report-page').getByRole('button', { name, exact: true }).click();
                assert(await page.locator('.report-content').isVisible());
            }
            await page.getByLabel('Cari', { exact: true }).fill('no-such-transaction');
            assert(await page.getByText('Tidak ada transaksi', { exact: true }).isVisible());
        });
        await step(role + ': mobile dashboard and navigation', async () => {
            await page.setViewportSize({ width: 390, height: 844 });
            await go('/dashboard');
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
            await page.screenshot({ path: path.join(output, role + '-mobile.png'), fullPage: true });
            await page.setViewportSize({ width: 1440, height: 1000 });
        });
        await step(role + ': logout and protected page', async () => {
            await go('/dashboard');
            await page.getByRole('button').filter({ hasText: 'Browser ' + (role === 'admin' ? 'Admin' : 'Manager') }).click();
            await saveRequest(() => page.getByRole('button', { name: 'Keluar', exact: true }).click(), '/api/logout');
            await page.waitForURL('**/login');
            await go('/invoice'); assert(new URL(page.url()).pathname === '/login');
        });
        await step(role + ': no JavaScript exceptions or server errors', async () => {
            assert.deepEqual(errors, []); assert.deepEqual(serverErrors, []);
        });
        await context.close();
    }
    await browser.close();
    fs.writeFileSync(path.join(output, process.env.BROWSER_TEST_MATCH ? 'focused-results.json' : 'results.json'), JSON.stringify(results, null, 2));
    console.log(`${results.filter(r => r.passed).length}/${results.length} browser checks passed`);
    process.exitCode = results.some(r => !r.passed) ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
