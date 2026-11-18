const { chromium } = require(process.env.PLAYWRIGHT_MODULE || process.env.TEMP + '/invoicing-browser-tests/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

// Supplemental UI validation against the running isolated runner, without login writes.
(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: process.env.BROWSER_HEADED !== '1', slowMo: process.env.BROWSER_HEADED === '1' ? 100 : 0 });
    try {
        const context = await browser.newContext({ timezoneId: 'Asia/Jakarta' });
        await context.clock.setFixedTime(new Date('2026-11-17T05:00:00Z'));
        const page = await context.newPage(), errors = [];
        let loginRequests = 0;
        page.on('request', r => { if (r.url().endsWith('/api/login')) loginRequests++; });
        page.on('pageerror', e => errors.push(e.message));
        page.on('requestfailed', r => errors.push(r.url()));
        await page.goto('http://127.0.0.1:8018/login'); await page.waitForLoadState('networkidle');
        const password = page.locator('input[autocomplete="current-password"]');
        await page.getByRole('button', { name: 'Masuk', exact: true }).click();
        await page.getByText('Username wajib diisi.', { exact: true }).waitFor();
        await page.getByText('Password wajib diisi.', { exact: true }).waitFor();
        await page.getByLabel('Username').fill('browser-admin');
        await page.getByRole('button', { name: 'Masuk', exact: true }).click();
        assert.equal(await page.getByText('Username wajib diisi.', { exact: true }).count(), 0);
        await page.getByText('Password wajib diisi.', { exact: true }).waitFor();
        await password.fill('QA-visible-password');
        await page.getByRole('button', { name: 'Tampilkan password', exact: true }).click();
        assert.equal(await password.getAttribute('type'), 'text');
        await page.getByRole('button', { name: 'Sembunyikan password', exact: true }).click();
        assert.equal(await password.getAttribute('type'), 'password');
        await password.fill('');
        await page.screenshot({ path: 'storage/app/browser-test-results/screenshots/login-required-validation.png' });
        assert.equal(loginRequests, 0); assert.deepEqual(errors, []);
        fs.writeFileSync('storage/app/browser-test-results/json/login-ui-validation.json', JSON.stringify({
            passed: true, emptyFields: true, partialCorrection: true, passwordVisibility: true, loginRequests,
            errors, scenarioDate: '2026-11-17',
        }, null, 2));
        console.log('PASS supplemental login required fields, correction, password visibility; zero login writes');
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
