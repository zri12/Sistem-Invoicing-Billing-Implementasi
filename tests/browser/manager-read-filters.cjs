const { chromium } = require(process.env.PLAYWRIGHT_MODULE || process.env.TEMP + '/invoicing-browser-tests/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs');
const root = 'storage/app/browser-test-results', base = 'http://127.0.0.1:8018';
(async () => {
    const state = JSON.parse(fs.readFileSync(root + '/json/full-system-state.json'));
    const browser = await chromium.launch({ channel: 'msedge', headless: process.env.BROWSER_HEADED !== '1', slowMo: process.env.BROWSER_HEADED === '1' ? 100 : 0 });
    const results = [], errors = [];
    try {
        const context = await browser.newContext({ timezoneId: 'Asia/Jakarta' });
        await context.clock.setFixedTime(new Date('2026-11-17T05:00:00Z'));
        const page = await context.newPage(); let writes = 0;
        page.on('pageerror', e => errors.push(e.message));
        page.on('requestfailed', r => errors.push(r.url()));
        page.on('response', r => { if (r.status() >= 500) errors.push(r.status() + ' ' + r.url()); });
        page.on('request', r => { if (r.url().includes('/api/') && !['GET', 'HEAD'].includes(r.method()) && !r.url().endsWith('/api/login')) writes++; });
        const go = async route => { await page.goto(base + route); await page.waitForLoadState('networkidle'); };
        const test = async (name, fn) => { await fn(); results.push({ name, passed: true }); console.log('PASS', name); };
        const hasNumber = () => page.locator('tbody').getByText(state.invoice.invoice_number, { exact: true });
        await go('/login'); await page.getByLabel('Username').fill('browser-manager');
        await page.locator('input[type=password]').fill('Browser-test-123!');
        await page.getByRole('button', { name: 'Masuk', exact: true }).click(); await page.waitForURL('**/dashboard');
        assert.equal(await page.evaluate(async () => (await (await fetch('/api/me', { headers: { Accept: 'application/json' } })).json()).data.role), 'manager');
        await test('Manager invoice document + payment status filters', async () => {
            await go('/invoice'); await page.getByPlaceholder('Cari nomor, nama, klien...').fill(state.invoice.invoice_number);
            await page.locator('main select').nth(0).selectOption('published'); await page.locator('main select').nth(1).selectOption('lunas');
            await hasNumber().waitFor(); assert.equal(await page.locator('tbody tr').count(), 1);
            await page.locator('main select').nth(0).selectOption('draft'); assert.equal(await hasNumber().count(), 0);
            await page.locator('main select').nth(0).selectOption('cancelled'); assert.equal(await hasNumber().count(), 0);
        });
        await test('Manager Billing status + search filters', async () => {
            await go('/billing'); await page.getByPlaceholder('Cari invoice, klien...').fill(state.invoice.invoice_number);
            await page.locator('main select').selectOption('lunas'); await hasNumber().waitFor();
            await page.locator('main select').selectOption('belum_dibayar'); assert.equal(await hasNumber().count(), 0);
        });
        await test('Manager payments account + method + period + search filters', async () => {
            await go('/pembayaran'); await page.getByPlaceholder('Cari invoice, klien...').fill(state.invoice.invoice_number);
            const selects = page.locator('main select'); await selects.nth(2).selectOption(String(state.account.id));
            await selects.nth(1).selectOption('Transfer Bank'); await selects.nth(0).selectOption('bulan_ini');
            await hasNumber().first().waitFor(); assert.equal(await hasNumber().count(), 3);
            await page.screenshot({ path: root + '/screenshots/manager-payment-filters.png', fullPage: true });
            await selects.nth(0).selectOption('bulan_lalu'); assert.equal(await hasNumber().count(), 0);
        });
        await test('Manager income account + category + search filters', async () => {
            const record = await page.evaluate(async id => (await (await fetch('/api/incomes?per_page=200', { headers: { Accept: 'application/json' } })).json()).data.items.find(i => i.id === id), state.income.id);
            assert(record); await go('/pemasukan'); await page.getByPlaceholder('Cari pemasukan...').fill(record.description);
            await page.locator('main select').nth(1).selectOption(String(state.account.id)); await page.locator('main select').nth(0).selectOption('Pendapatan Jasa');
            await page.locator('tbody').getByText(record.description, { exact: true }).waitFor();
            await page.locator('main select').nth(0).selectOption('Pendapatan Lainnya'); assert.equal(await page.locator('tbody tr').count(), 0);
        });
        await test('Manager expense vendor + category + search filters', async () => {
            await go('/pengeluaran'); await page.getByPlaceholder('Cari pengeluaran...').fill(state.expense_cash.description);
            await page.locator('main select').nth(0).selectOption(String(state.vendor.id)); await page.locator('main select').nth(1).selectOption('Operasional');
            await page.locator('tbody').getByText(state.expense_cash.description, { exact: true }).waitFor();
            await page.locator('main select').nth(1).selectOption('Marketing'); assert.equal(await page.locator('tbody').getByText(state.expense_cash.description, { exact: true }).count(), 0);
        });
        assert.equal(writes, 0); assert.deepEqual(errors, []);
        fs.writeFileSync(root + '/json/manager-read-filter-results.json', JSON.stringify({ results, writes, errors }, null, 2));
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
