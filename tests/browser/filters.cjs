const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = 'http://127.0.0.1:8018';
(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: process.env.BROWSER_HEADED !== '1', slowMo: process.env.BROWSER_HEADED === '1' ? 100 : 0 });
    const results = [];
    for (const role of ['admin', 'manager']) {
        const context = await browser.newContext({ timezoneId: 'Asia/Jakarta' });
        await context.clock.setFixedTime(new Date('2026-11-17T05:00:00Z'));
        const page = await context.newPage();
        await page.goto(base + '/login');
        await page.getByLabel('Username').fill('browser-' + role);
        await page.locator('input[type=password]').fill('Browser-test-123!');
        await page.getByRole('button', { name: 'Masuk', exact: true }).click();
        await page.waitForURL('**/dashboard');
        if (role === 'admin') {
            await page.goto(base + '/pengeluaran');
            await page.getByRole('button', { name: 'Tambah Pengeluaran', exact: true }).click();
            const dialog = page.getByRole('dialog');
            await dialog.getByLabel('Nominal (Rp)').fill('5000');
            await dialog.getByLabel('Vendor', { exact: true }).selectOption({ label: 'Browser Test Vendor' });
            await dialog.getByLabel('Kategori').selectOption('Operasional');
            await dialog.getByLabel('Rekening Sumber').selectOption({ index: 1 });
            await dialog.getByLabel('Keterangan').fill('E2E vendor filter');
            const saved = page.waitForResponse(r => r.url().endsWith('/api/expenses') && r.request().method() === 'POST');
            await dialog.getByRole('button', { name: 'Simpan', exact: true }).click();
            assert.equal((await saved).status(), 201);
        }
        for (const [route, option, text] of [
            ['/pemasukan', 'Semua Rekening', 'E2E pemasukan Updated'],
            ['/pengeluaran', 'Semua Vendor', 'E2E vendor filter'],
        ]) {
            await page.goto(base + route); await page.waitForLoadState('networkidle');
            const select = page.locator('select').filter({ has: page.locator('option', { hasText: option }) });
            await select.selectOption({ label: route === '/pemasukan' ? 'Browser Test Bank' : 'Browser Test Vendor' });
            assert(await page.locator('tbody').getByText(text, { exact: true }).isVisible());
            results.push({ name: role + ': ' + route + ' filter', passed: true });
            console.log('PASS', role, route, 'filter');
        }
        await context.close();
    }
    await browser.close();
    fs.writeFileSync('storage/app/browser-test-results/filter-results.json', JSON.stringify(results, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
