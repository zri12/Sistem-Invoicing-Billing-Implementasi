const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
    const output = path.resolve('storage/app/browser-test-results/report-print');
    fs.mkdirSync(output, { recursive: true });
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const results = [];
    try {
        for (const role of ['admin', 'manager']) {
            const context = await browser.newContext({ timezoneId: 'Asia/Jakarta' });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto('http://127.0.0.1:8018/login');
            await page.getByLabel('Username').fill('browser-' + role);
            await page.locator('input[type=password]').fill('Browser-test-123!');
            await page.getByRole('button', { name: 'Masuk', exact: true }).click();
            await page.waitForURL('**/dashboard');
            await page.goto('http://127.0.0.1:8018/laporan');
            await page.getByRole('button', { name: 'Cetak', exact: true }).waitFor();
            await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Cetak')?.disabled);
            await page.evaluate(() => { window.__printCalls = 0; window.print = () => { window.__printCalls++; }; });
            await page.getByRole('button', { name: 'Cetak', exact: true }).click();
            await page.getByRole('button', { name: 'Simpan PDF', exact: true }).click();
            assert.equal(await page.evaluate(() => window.__printCalls), 2);
            await page.getByLabel('Tanggal Awal').fill('2025-01-01');
            await page.getByLabel('Tanggal Akhir').fill('2026-12-31');
            for (const [key, label] of [['kas', 'Keuangan / Debit & Kredit'], ['invoice', 'Invoice'], ['pembayaran', 'Pembayaran'], ['pemasukan', 'Pemasukan'], ['pengeluaran', 'Pengeluaran']]) {
                await page.locator('.report-toolbar').getByRole('button', { name: label, exact: true }).click();
                const count = await page.locator('.report-print tbody tr:not(:has(.print-empty))').count();
                const printCount = await page.locator('.report-print .print-filters').innerText();
                assert(printCount.includes('Jumlah data ' + count), `${role} ${key}: count mismatch`);
                await page.emulateMedia({ media: 'print' });
                await page.pdf({ path: path.join(output, `${role}-${key}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
                await page.emulateMedia({ media: 'screen' });
                results.push({ role, key, count });
                console.log(`PASS ${role} ${key}: ${count} filtered rows`);
            }
            await page.getByLabel('Cari').fill('TIDAK-ADA-DATA-PRINT-TEST');
            await page.emulateMedia({ media: 'print' });
            assert(await page.locator('.report-print .print-empty').isVisible());
            await page.pdf({ path: path.join(output, `${role}-empty.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
            assert.deepEqual(errors, []);
            await context.close();
        }
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
