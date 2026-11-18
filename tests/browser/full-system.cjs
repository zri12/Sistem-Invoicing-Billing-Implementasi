const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const base = 'http://127.0.0.1:8018';
const root = path.resolve('storage/app/browser-test-results');
for (const dir of ['screenshots', 'json', 'pdf', 'logs']) fs.mkdirSync(path.join(root, dir), { recursive: true });
const runId = Date.now().toString(36), prefix = kind => `E2E-${kind}-${runId}`;
const results = [], network = [], errors = [], warnings = [], expected = new Map();
const authenticatedContexts = new WeakMap();
const state = {};
let browser, context, page;
const today = '2026-11-17'; // Requested QA business date, shared with the isolated router.
function dateOffset(days, months = 0) { const d = new Date(today + 'T12:00:00Z'); d.setUTCMonth(d.getUTCMonth() + months); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
const money = value => `Rp ${Number(value).toLocaleString('id-ID')}`;
function expectedStatus(method, route, status) {
    if (status < 400) return;
    const key = `${method} ${route.split('?')[0]} ${status}`;
    expected.set(key, (expected.get(key) || 0) + 1);
}
function watch(p) {
    p.on('pageerror', e => errors.push({ type: 'pageerror', text: e.message, url: p.url() }));
    p.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource:')) errors.push({ type: 'console.error', text: msg.text(), url: p.url() });
        if (msg.type() === 'warning') warnings.push(msg.text());
    });
    p.on('requestfailed', req => errors.push({ type: 'requestfailed', url: req.url(), error: req.failure() }));
    p.on('response', res => {
        const route = new URL(res.url()).pathname;
        const key = `${res.request().method()} ${route} ${res.status()}`;
        const allowed = (expected.get(key) || 0) > 0;
        if (allowed) expected.set(key, expected.get(key) - 1);
        network.push({ method: res.request().method(), url: res.url(), status: res.status(), expected: res.status() < 400 || allowed });
    });
}
function saveEvidence() {
    const resultFile = process.env.FULL_QA_PHASE ? `focused-${process.env.FULL_QA_PHASE}-results.json` : 'full-system-results.json';
    fs.writeFileSync(path.join(root, 'json', resultFile), JSON.stringify({ runId, date: today, results, errors, warnings, networkCount: network.length }, null, 2));
    fs.writeFileSync(path.join(root, 'logs/full-system-network.json'), JSON.stringify(network, null, 2));
    fs.writeFileSync(path.join(root, 'json/full-system-state.json'), JSON.stringify(state, null, 2));
}
async function test(name, fn) {
    try { await fn(); results.push({ name, passed: true }); console.log('PASS', name); saveEvidence(); }
    catch (e) {
        results.push({ name, passed: false, error: e.message });
        console.error('FAIL', name, e.message);
        if (page && !page.isClosed()) await page.screenshot({ path: path.join(root, `screenshots/failure-${runId}-${results.length}.png`), fullPage: true }).catch(() => {});
        saveEvidence(); throw e;
    }
}
async function go(route) {
    // Let paginated bootstrap requests finish before leaving the current page.
    await page.waitForLoadState('networkidle');
    if (!authenticatedContexts.get(context)) expectedStatus('GET', '/api/me', 401);
    await page.goto(base + route); await page.waitForLoadState('networkidle');
}
async function snap(name) { await page.screenshot({ path: path.join(root, `screenshots/${name}.png`), fullPage: true }); }
async function api(method, route, data, status = 200) {
    expectedStatus(method, '/api' + route, status);
    const response = await page.evaluate(async ({ method, route, data }) => {
        const xsrf = document.cookie.split('; ').find(x => x.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=');
        const r = await fetch('/api' + route, { method, credentials: 'same-origin', headers: {
            Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest',
            ...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
        }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
        return { status: r.status, body: await r.json() };
    }, { method, route, data });
    assert.equal(response.status, status, JSON.stringify(response.body));
    assert.equal(response.body.success, status < 400);
    assert.equal(typeof response.body.message, 'string');
    if (status < 400) assert('data' in response.body);
    if (status === 422) assert(response.body.errors && Object.keys(response.body.errors).length);
    return response.body.data;
}
async function submit(button, route, status = 200, method) {
    if (status >= 400) expectedStatus(method || 'POST', '/api' + route, status);
    const received = page.waitForResponse(r => new URL(r.url()).pathname === '/api' + route && r.request().method() !== 'GET' && (!method || r.request().method() === method), { timeout: 90000 });
    await button.click();
    const response = await received;
    const body = await response.json();
    assert.equal(response.status(), status, JSON.stringify(body));
    assert.equal(body.success, status < 400);
    assert.equal(typeof body.message, 'string');
    await page.waitForLoadState('networkidle');
    return body.data;
}
function db() {
    const r = spawnSync('php', ['tests/browser/database.php', '--snapshot'], { cwd: process.cwd(), encoding: 'utf8', env: process.env });
    assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout);
}
function row(table, id) { const found = db()[table].find(x => x.id === id); assert(found, `${table} id=${id} absent`); return found; }
async function persist(table, id, fields, endpoint) {
    const actual = row(table, id);
    for (const [key, value] of Object.entries(fields)) assert.equal(actual[key], value, `${table}.${key} database`);
    if (endpoint) {
        const response = await api('GET', endpoint);
        const data = response.meta && Array.isArray(response.items) ? response.items.find(item => item.id === id) : response;
        assert(data, endpoint + ' does not contain persisted record ' + id);
        for (const [key, value] of Object.entries(fields)) {
            // Monetary API fields are DECIMAL strings; compare their exact numeric value.
            const actual = typeof value === 'number' && ['amount', 'total', 'subtotal', 'discount', 'default_price', 'qty', 'opening_balance'].includes(key) ? Number(data[key]) : data[key];
            assert.equal(actual, value, `${endpoint}.${key}`);
        }
    }
    await page.reload(); await page.waitForLoadState('networkidle');
}
async function login(role, password = 'Browser-test-123!', status = 200) {
    await go('/login');
    assert.equal(await page.evaluate(() => new Date().toLocaleDateString('en-CA')), today, 'Browser QA business date');
    await page.getByLabel('Username').fill(role.startsWith('browser-') || role.startsWith('E2E-') ? role : 'browser-' + role);
    await page.locator('input[type=password]').fill(password);
    await submit(page.getByRole('button', { name: 'Masuk', exact: true }), '/login', status);
    if (status === 200) { authenticatedContexts.set(context, true); await page.waitForURL('**/dashboard'); await page.waitForLoadState('networkidle'); }
}
async function freshContext(role) {
    context = await browser.newContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true, timezoneId: 'Asia/Jakarta' });
    await context.clock.setFixedTime(new Date('2026-11-17T05:00:00Z'));
    page = await context.newPage(); page.setDefaultTimeout(30000); watch(page);
    await login(role);
}
async function logout() {
    await go('/dashboard');
    await page.locator('aside').getByRole('button').filter({ hasText: /Browser (Admin|Manager)/ }).click();
    await submit(page.getByRole('button', { name: 'Keluar', exact: true }), '/logout');
    authenticatedContexts.set(context, false);
    await page.waitForURL('**/login');
}
async function fillFields(scope, fields) {
    for (const [label, value] of Object.entries(fields)) {
        const control = scope.getByLabel(label, { exact: false });
        if (await control.evaluate(e => e.tagName) === 'SELECT') await control.selectOption(value);
        else await control.fill(String(value));
    }
}
async function assertImages() {
    await page.waitForFunction(() => [...document.images].every(i => i.complete));
    const failed = await page.locator('img').evaluateAll(list => list.filter(i => !i.naturalWidth).map(i => i.src));
    assert.deepEqual(failed, []);
}
async function checkSearch(route, query, expectedText) {
    await go(route); const search = page.getByPlaceholder(/^Cari/).first();
    for (const term of [query, query.slice(0, 9).toLowerCase(), query.toUpperCase()]) {
        await search.fill(term); assert(await page.locator('tbody').getByText(expectedText, { exact: true }).isVisible());
    }
    await search.fill("no-match-O'Connor-&-()" + runId);
    assert.equal(await page.locator('tbody tr').filter({ hasText: expectedText }).count(), 0);
    await search.fill('');
}
async function paginate(route) {
    await go(route);
    const next = page.getByRole('button', { name: 'Halaman berikutnya', exact: true });
    assert(await next.isEnabled(), `${route}: needs >1 page`);
    const first = await page.locator('tbody tr').allTextContents();
    await next.click(); const second = await page.locator('tbody tr').allTextContents();
    assert(second.length > 0); assert(!second.some(x => first.includes(x)), `${route}: duplicate rows between pages`);
    await page.getByRole('button', { name: 'Halaman sebelumnya', exact: true }).click();
    assert.deepEqual(await page.locator('tbody tr').allTextContents(), first);
    await page.getByRole('button', { name: 'Halaman 2', exact: true }).click();
    const search = page.getByPlaceholder(/^Cari/).first();
    if (await search.count()) {
        await search.fill('no-match-' + runId);
        assert(await page.getByRole('button', { name: 'Halaman sebelumnya', exact: true }).isDisabled());
    }
}
function invoiceData(overrides = {}) { return { invoice_name: prefix('INVOICE-API'), client_id: state.client.id,
    invoice_date: today, due_date: dateOffset(10), payment_account_id: state.account.id, discount: 0,
    items: [{ product_service_id: state.product.id, description: 'Maintenance / Support', price: 1000000, qty: 1 }], ...overrides }; }
async function createInvoiceForm(name, publish = false) {
    await go('/invoice/create');
    await fillFields(page, { 'Nama Invoice': name, 'Tanggal Invoice': today, 'Jatuh Tempo': dateOffset(10) });
    await page.getByLabel('Klien', { exact: false }).selectOption(String(state.client.id));
    await page.getByLabel('Rekening Penerima').selectOption(String(state.account.id));
    await page.locator('select').last().selectOption({ label: state.product.name });
    await page.getByPlaceholder('Deskripsi item').fill('Maintenance / Support (Bandung)');
    await page.getByLabel('Syarat & Ketentuan').fill('Terms: pembayaran bertahap. ' + 'Syarat wajar untuk Indonesia. '.repeat(3));
    await page.getByLabel('Catatan', { exact: true }).fill("Catatan O'Connor & Jaya / QA");
    const result = await submit(page.getByRole('button', { name: publish ? 'Simpan & Terbitkan' : 'Simpan Draft', exact: true }), '/invoices', 201);
    await page.waitForURL('**/invoice/' + result.id); return result;
}
async function payment(amount, expectedAmount, proof = false) {
    await go('/invoice/' + state.invoice.id);
    const warmIncome = page.waitForResponse(r => new URL(r.url()).pathname === '/api/incomes' && r.request().method() === 'GET');
    await page.getByRole('navigation').getByRole('button', { name: 'Pemasukan', exact: true }).click();
    await page.waitForURL('**/pemasukan'); await warmIncome; await page.waitForLoadState('networkidle');
    await page.goBack(); await page.waitForURL('**/invoice/' + state.invoice.id); await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Catat Pembayaran', exact: true }).click();
    const d = page.getByRole('dialog'); await d.getByLabel('Nominal (Rp)').fill(String(amount));
    await d.getByLabel('Tanggal Pembayaran').fill(today);
    await d.getByLabel('Nomor Referensi').fill(prefix('PAYMENT') + '-' + amount);
    await d.getByLabel('Catatan', { exact: true }).fill('Bukti pembayaran QA');
    if (proof) await d.locator('input[type=file]').setInputFiles(path.join(root, 'fixtures/logo.png'));
    const record = await submit(d.getByRole('button', { name: 'Simpan Pembayaran', exact: true }), `/invoices/${state.invoice.id}/payments`, 201);
    const billing = await api('GET', '/billing/' + state.invoice.id);
    assert.equal(billing.total_paid, expectedAmount); assert.equal(billing.remaining, 10000000 - expectedAmount);
    const related = db().incomes.filter(i => i.payment_id === record.id); assert.equal(related.length, 1);
    assert.equal(Number(related[0].amount), amount); assert.equal(related[0].account_id, state.account.id);
    if (proof) { assert(record.proof_url); const res = await context.request.get(base + record.proof_url); assert.equal(res.status(), 200); }
    return record;
}
async function download(name) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Simpan PDF', exact: true }).click();
    const downloaded = await pending; const file = path.join(root, 'pdf/' + name + '.pdf');
    await downloaded.saveAs(file); assert.equal(fs.readFileSync(file).subarray(0, 5).toString(), '%PDF-');
    const data = db(), id = Number(new URL(page.url()).pathname.split('/')[2]);
    const invoice = data.invoices.find(i => i.id === id), company = data.companies[0], template = data.invoice_template_settings[0];
    state.pdfExpectations ||= [];
    state.pdfExpectations = state.pdfExpectations.filter(p => p.file !== name + '.pdf');
    state.pdfExpectations.push({ file: name + '.pdf', invoice: invoice.invoice_name, number: invoice.invoice_number,
        client: data.clients.find(c => c.id === invoice.client_id).name,
        signer: company.signer_name, position: company.signer_title, company: company.name,
        account: data.accounts.find(a => a.id === invoice.payment_account_id).account_number,
        descriptions: data.invoice_items.filter(i => i.invoice_id === id).map(i => i.description),
        terms: invoice.payment_terms, singlePage: name.startsWith('golden-'), template });
}
async function concurrency(job, invoiceId, count) {
    const gate = path.join(root, 'logs', `barrier-${job}-${Date.now()}`);
    const children = Array.from({ length: count }, () => {
        const child = spawn('php', ['tests/browser/database.php', '--worker', job, String(invoiceId), gate], { cwd: process.cwd(), env: process.env });
        let stdout = '', stderr = '';
        const ready = new Promise((resolve, reject) => {
            child.stdout.on('data', b => { stdout += b; if (stdout.includes('READY')) resolve(); });
            child.once('error', reject);
        });
        const done = new Promise((resolve, reject) => {
            child.stderr.on('data', b => stderr += b);
            child.once('close', code => code === 0 ? resolve(JSON.parse(stdout.split('\n').slice(1).join('\n'))) : reject(new Error(stderr || stdout)));
        });
        return { ready, done };
    });
    await Promise.all(children.map(c => c.ready)); fs.writeFileSync(gate, 'GO');
    return Promise.all(children.map(c => c.done));
}

async function run() {
    browser = await chromium.launch({ channel: 'msedge', headless: process.env.BROWSER_HEADED !== '1', slowMo: process.env.BROWSER_HEADED === '1' ? 100 : 0 });
    if (process.env.FULL_QA_PHASE) {
        Object.assign(state, JSON.parse(fs.readFileSync(path.join(root, 'json/full-system-state.json'))));
        await freshContext('admin');
        for (const [key, endpoint] of [['client', 'clients'], ['vendor', 'vendors'], ['product', 'products-services'], ['account', 'accounts']]) {
            const current = await api('GET', `/${endpoint}/${state[key].id}`);
            if (current.status !== 'aktif') await api('PATCH', `/${endpoint}/${current.id}/status`, {});
            state[key] = await api('GET', `/${endpoint}/${current.id}`);
        }
        const phases = { remaining: () => remainingModules([]), financial: financialChecks, settings: async () => { await companySettings(); await userLifecycle(); },
            users: userLifecycle, responsive: () => securityAndResponsive([]), double: doubleSubmitTests };
        assert(phases[process.env.FULL_QA_PHASE], 'Unknown focused QA phase');
        await phases[process.env.FULL_QA_PHASE]();
        console.log('Focused QA phase passed; this is not a full-system pass.');
        saveEvidence(); await browser.close(); return;
    }
    await test('Admin authentication, wrong password, missing username, active session and new tab', async () => {
        context = await browser.newContext({ viewport: { width: 1366, height: 768 }, timezoneId: 'Asia/Jakarta', acceptDownloads: true });
        await context.clock.setFixedTime(new Date('2026-11-17T05:00:00Z'));
        page = await context.newPage(); watch(page); page.setDefaultTimeout(30000);
        await login('admin', 'wrong-password', 422);
        assert(await page.getByText('Username atau password salah.', { exact: true }).isVisible());
        await login('browser-unknown', 'invalid', 422); await login('admin');
        assert.equal((await api('GET', '/me')).role, 'admin');
        await page.reload(); await page.waitForLoadState('networkidle');
        const extra = await context.newPage(); watch(extra); await extra.goto(base + '/invoice'); await extra.waitForLoadState('networkidle');
        assert.equal(new URL(extra.url()).pathname, '/invoice'); await extra.close();
    });

    const masters = [
        { kind: 'CLIENT', route: '/klien', api: '/clients', table: 'clients', button: 'Tambah Klien', label: 'Nama Klien / Perusahaan', fields: { 'Nama PIC': "O'Connor", Alamat: 'Jl. Maju & Jaya / Bandung (Indonesia)', 'Nomor Telepon': '081234567890', Email: 'client-' + runId + '@example.test', Catatan: 'Catatan dengan é dan ampersand &' }, payload: { name: prefix('CLIENT'), pic_name: "O'Connor", address: 'Jl. Maju & Jaya / Bandung (Indonesia)', phone: '081234567890', email: 'client-' + runId + '@example.test', notes: 'Catatan dengan é dan ampersand &' }, state: 'client' },
        { kind: 'VENDOR', route: '/vendor', api: '/vendors', table: 'vendors', button: 'Tambah Vendor', label: 'Nama Vendor', fields: { 'Nama PIC': 'PIC Vendor', Alamat: 'Bandung / Jawa Barat', 'Nomor Telepon': '08123450000', Email: 'vendor-' + runId + '@example.test' }, payload: { name: prefix('VENDOR'), pic_name: 'PIC Vendor', address: 'Bandung / Jawa Barat', phone: '08123450000', email: 'vendor-' + runId + '@example.test' }, state: 'vendor' },
        { kind: 'PRODUCT', route: '/produk-layanan', api: '/products-services', table: 'products_services', button: 'Tambah Produk / Layanan', label: 'Nama Produk / Layanan', fields: { Deskripsi: 'Maintenance / Support (Indonesia)', 'Harga Awal (Rp)': '10000000', Satuan: 'project' }, payload: { name: prefix('PRODUCT'), description: 'Maintenance / Support (Indonesia)', default_price: '10000000', unit: 'project' }, state: 'product' },
        { kind: 'ACCOUNT', route: '/rekening', api: '/accounts', table: 'accounts', button: 'Tambah Rekening', label: 'Nama Bank / Kas', fields: { 'Nomor Rekening': '1234567890', 'Atas Nama': 'PT Maju & Jaya', Cabang: 'Bandung' }, payload: { name: prefix('ACCOUNT'), account_number: '1234567890', account_holder: 'PT Maju & Jaya', branch: 'Bandung' }, state: 'account' },
    ];
    for (const m of masters) {
        await test(`${m.kind}: full field create, UI required validation, refresh, DB/API persistence`, async () => {
            await go(m.route); await page.getByRole('button', { name: m.button, exact: true }).click();
            const d = page.getByRole('dialog');
            await d.getByRole('button', { name: 'Simpan', exact: true }).click();
            assert(await d.getByText(/wajib diisi/).count() > 0); assert.equal(await d.count(), 1);
            await fillFields(d, { [m.label]: m.payload.name, ...m.fields });
            const record = await submit(d.getByRole('button', { name: 'Simpan', exact: true }), m.api, 201);
            state[m.state] = record;
            const fields = { ...m.payload }; if (fields.default_price) fields.default_price = Number(fields.default_price);
            await persist(m.table, record.id, fields, m.api + '/' + record.id);
            await page.getByPlaceholder(/^Cari/).fill(record.name);
            assert(await page.locator('tbody').getByText(record.name, { exact: true }).isVisible());
            await snap(m.kind.toLowerCase() + '-created');
        });
        await test(`${m.kind}: edit all fields, status nonaktif then aktif and search`, async () => {
            const record = state[m.state]; await page.getByRole('button', { name: 'Aksi ' + record.name, exact: true }).click();
            await page.getByRole('button', { name: 'Edit', exact: true }).click();
            const d = page.getByRole('dialog');
            const editedFields = Object.fromEntries(Object.entries(m.fields).map(([k, v]) => [k, k === 'Harga Awal (Rp)' ? '10000000' : k === 'Email' ? 'edited-' + v : k === 'Nomor Telepon' || k === 'Nomor Rekening' ? v + '1' : v + ' Updated']));
            await fillFields(d, { [m.label]: record.name + ' Updated', ...editedFields, Status: 'nonaktif' });
            const updated = await submit(d.getByRole('button', { name: 'Simpan', exact: true }), m.api + '/' + record.id, 200, 'PUT');
            assert.equal(updated.status, 'nonaktif'); state[m.state] = updated;
            const keys = { 'Nama PIC': 'pic_name', Alamat: 'address', 'Nomor Telepon': 'phone', Email: 'email', Catatan: 'notes',
                Deskripsi: 'description', 'Harga Awal (Rp)': 'default_price', Satuan: 'unit', 'Nomor Rekening': 'account_number', 'Atas Nama': 'account_holder', Cabang: 'branch' };
            const expectedFields = { name: updated.name, status: 'nonaktif' };
            for (const [label, value] of Object.entries(editedFields)) expectedFields[keys[label]] = label === 'Harga Awal (Rp)' ? Number(value) : value;
            await persist(m.table, record.id, expectedFields, m.api + '/' + record.id);
            await page.getByPlaceholder(/^Cari/).fill(updated.name);
            await page.getByRole('button', { name: 'Aksi ' + updated.name, exact: true }).click();
            await page.getByRole('button', { name: 'Edit', exact: true }).click();
            for (const [label, value] of Object.entries(editedFields)) assert.equal(await d.getByLabel(label, { exact: false }).inputValue(), String(value), m.kind + ' refreshed field ' + label);
            await d.getByRole('button', { name: 'Batal', exact: true }).click();
            await page.getByPlaceholder(/^Cari/).fill(updated.name);
            await page.getByRole('button', { name: 'Aksi ' + updated.name, exact: true }).click();
            await page.getByRole('button', { name: 'Aktifkan', exact: true }).click();
            await submit(page.getByRole('dialog').getByRole('button', { name: 'Aktifkan', exact: true }), m.api + '/' + record.id + '/status', 200, 'PATCH');
            await persist(m.table, record.id, { status: 'aktif' }, m.api + '/' + record.id);
            await checkSearch(m.route, updated.name, updated.name);
        });
        await test(`${m.kind}: pagination, active status filter and cancel/reopen modal`, async () => {
            for (let i = 0; i < 7; i++) await api('POST', m.api, { ...m.payload, name: prefix(m.kind) + '-' + i, status: i === 6 ? 'nonaktif' : 'aktif' }, 201);
            await paginate(m.route); await go(m.route);
            await page.locator('select').first().selectOption('nonaktif');
            assert(await page.locator('tbody tr').count() > 0); assert(!(await page.locator('tbody').innerText()).includes('Aktif\n'));
            await page.getByRole('button', { name: m.button, exact: true }).click();
            const d = page.getByRole('dialog'); await d.getByLabel(m.label).fill('UNSAVED');
            await d.getByRole('button', { name: 'Batal', exact: true }).click();
            await page.getByRole('button', { name: m.button, exact: true }).click();
            assert.equal(await d.getByLabel(m.label).inputValue(), '');
            await d.getByRole('button', { name: 'Tutup modal', exact: true }).click();
        });
    }

    await test('Invoice draft: full form, persistence, no Billing entry or Income', async () => {
        state.invoice = await createInvoiceForm(prefix('INVOICE-GOLDEN'));
        assert.equal(state.invoice.document_status, 'draft'); assert.equal(Number(state.invoice.total), 10000000);
        await persist('invoices', state.invoice.id, { document_status: 'draft' }, '/invoices/' + state.invoice.id);
        const billing = await api('GET', '/billing?per_page=200'); assert(!billing.items.some(x => x.invoice.id === state.invoice.id));
        assert.equal(db().incomes.filter(i => i.invoice_id === state.invoice.id).length, 0);
        await snap('invoice-draft');
    });
    await test('Invoice draft edit: add/remove item, quantity, price, discount, immutable number and browser history', async () => {
        await go('/invoice/' + state.invoice.id + '/edit');
        await page.getByLabel('Nama Invoice').fill(prefix('INVOICE-EDITED'));
        await page.getByRole('button', { name: 'Tambah Item', exact: true }).click();
        await page.getByRole('button', { name: 'Hapus item', exact: true }).last().click();
        await page.getByPlaceholder('Deskripsi item').fill('Edited service / details ' + 'Deskripsi panjang yang wajar. '.repeat(3));
        await page.getByLabel('Catatan', { exact: true }).fill('Updated notes');
        const updated = await submit(page.getByRole('button', { name: 'Simpan Perubahan', exact: true }), '/invoices/' + state.invoice.id, 200, 'PUT');
        assert.equal(updated.invoice_number, state.invoice.invoice_number); assert.equal(updated.document_status, 'draft');
        await page.waitForURL('**/invoice/' + state.invoice.id);
        await persist('invoices', state.invoice.id, { invoice_name: prefix('INVOICE-EDITED'), invoice_notes: 'Updated notes' }, '/invoices/' + state.invoice.id);
        await page.goBack(); await page.waitForLoadState('networkidle'); await page.goForward(); await page.waitForLoadState('networkidle');
        assert(!(await page.locator('body').innerText()).includes('Invoice tidak ditemukan.'));
    });
    await test('Publish, edit published preserves state and number, no automatic Income', async () => {
        await go('/invoice/' + state.invoice.id);
        const published = await submit(page.getByRole('button', { name: 'Terbitkan', exact: true }), '/invoices/' + state.invoice.id + '/publish');
        assert.equal(published.document_status, 'published'); assert.equal(published.invoice_number, state.invoice.invoice_number);
        const billing = await api('GET', '/billing/' + state.invoice.id); assert.equal(billing.remaining, 10000000);
        assert.equal(db().incomes.filter(i => i.invoice_id === state.invoice.id).length, 0);
        await go('/invoice/' + state.invoice.id + '/edit');
        await page.getByLabel('Catatan', { exact: true }).fill('Published updated notes');
        const updated = await submit(page.getByRole('button', { name: 'Simpan Perubahan', exact: true }), '/invoices/' + state.invoice.id, 200, 'PUT');
        assert.equal(updated.document_status, 'published'); assert.equal(updated.invoice_number, state.invoice.invoice_number);
        await page.waitForURL('**/invoice/' + state.invoice.id); await page.reload(); await page.waitForLoadState('networkidle');
        await snap('invoice-published');
    });
    await test('Payment #1 Rp3m, proof, Billing Rp7m, Income and live dashboard/report synchronization', async () => {
        state.firstPayment = await payment(3000000, 3000000, true);
        await page.getByRole('navigation').getByRole('button', { name: 'Pemasukan', exact: true }).click();
        await page.waitForURL('**/pemasukan');
        await page.waitForLoadState('networkidle');
        await page.getByPlaceholder('Cari pemasukan...').fill(state.invoice.invoice_number);
        await page.locator('tbody').getByText(money(3000000), { exact: true }).waitFor({ state: 'visible' });
        assert(await page.locator('tbody').getByText(money(3000000), { exact: true }).isVisible());
        await page.reload(); await page.waitForLoadState('networkidle');
        assert(await page.locator('tbody').getByText(money(3000000), { exact: true }).isVisible());
        await go('/billing/' + state.invoice.id); await snap('billing-partial');
        await go('/invoice/' + state.invoice.id + '/preview'); await assertImages(); await download('golden-partial-admin');
    });
    await test('Payment #2 Rp2m, overpayment rejected without mutation, full Rp5m and further payment rejected', async () => {
        await payment(2000000, 5000000);
        const before = db();
        const payload = { payment_date: today, amount: 6000000, method: 'cash', account_id: state.account.id };
        await api('POST', '/invoices/' + state.invoice.id + '/payments', payload, 422);
        assert.equal(db().payments.length, before.payments.length); assert.equal(db().incomes.length, before.incomes.length);
        await api('POST', '/invoices/' + state.invoice.id + '/cancel', {}, 422);
        await payment(5000000, 10000000);
        await api('POST', '/invoices/' + state.invoice.id + '/payments', { ...payload, amount: 1 }, 422);
        assert.equal((await api('GET', '/billing/' + state.invoice.id)).status, 'paid');
        await go('/billing/' + state.invoice.id); await snap('billing-paid');
        await go('/invoice/' + state.invoice.id + '/preview'); await download('golden-paid-admin');
    });

    // Additional independent audit modules are defined below.
    await remainingModules(masters);
    saveEvidence(); await browser.close();
    console.log(`${results.length}/${results.length} full-system scenarios passed`);
}

async function remainingModules(masters) {
    await test('Manual Income: all fields, custom source, edit, DB/API/UI and cashbook persistence', async () => {
        const otherAccount = (await api('GET', '/accounts?per_page=200')).items.find(a => a.status === 'aktif' && a.id !== state.account.id);
        assert(otherAccount);
        await go('/pemasukan'); await page.getByRole('button', { name: 'Tambah Pemasukan', exact: true }).click();
        const d = page.getByRole('dialog');
        await fillFields(d, { Tanggal: today, 'Nominal (Rp)': '450000', Sumber: "O'Connor / Non-invoice", Kategori: 'Pendapatan Lainnya', Keterangan: prefix('INCOME'), Catatan: 'QA notes' });
        await d.getByLabel('Rekening', { exact: true }).selectOption(String(otherAccount.id));
        state.income = await submit(d.getByRole('button', { name: 'Simpan', exact: true }), '/incomes', 201);
        await persist('incomes', state.income.id, { source: "O'Connor / Non-invoice", source_type: 'manual', account_id: otherAccount.id });
        await page.locator('tbody tr').filter({ hasText: prefix('INCOME') }).getByRole('button', { name: 'Edit', exact: true }).click();
        assert.equal(await d.getByLabel('Sumber', { exact: true }).inputValue(), "O'Connor / Non-invoice");
        await fillFields(d, { Tanggal: dateOffset(-1), 'Nominal (Rp)': '550000', Kategori: 'Pendapatan Jasa', Keterangan: prefix('INCOME') + ' Updated', Catatan: 'Updated notes' });
        await d.getByLabel('Rekening', { exact: true }).selectOption(String(state.account.id));
        await submit(d.getByRole('button', { name: 'Simpan', exact: true }), '/incomes/' + state.income.id, 200, 'PUT');
        await persist('incomes', state.income.id, { source: "O'Connor / Non-invoice", income_date: dateOffset(-1), amount: 550000, category: 'Pendapatan Jasa', description: prefix('INCOME') + ' Updated', notes: 'Updated notes', account_id: state.account.id }, '/incomes?per_page=200');
        await checkSearch('/pemasukan', prefix('INCOME'), prefix('INCOME') + ' Updated'); await snap('income');
        const cashbook = await api('GET', `/reports/cashbook?from=${dateOffset(-1)}&to=${today}&account_id=${state.account.id}`);
        assert(cashbook.entries.some(e => e.id === 'income-' + state.income.id && e.type === 'debit' && e.amount === 550000));
    });

    for (const kind of ['cash', 'qris', 'credit', 'transfer']) await test('Expense ' + kind + ': full fields, proof, refresh and cashbook credit', async () => {
        await go('/pengeluaran'); await page.getByRole('button', { name: 'Tambah Pengeluaran', exact: true }).click();
        const d = page.getByRole('dialog');
        await d.getByRole('button', { name: 'Simpan', exact: true }).click();
        assert(await d.getByText(/Lengkapi/).isVisible());
        await fillFields(d, { Tanggal: today, 'Nominal (Rp)': '125000', Vendor: String(state.vendor.id), Kategori: 'Operasional',
            'Jenis Transaksi': kind, 'Rekening Sumber': String(state.account.id), 'Nomor Referensi': prefix('EXPENSE-REF-' + kind), Keterangan: prefix('EXPENSE-' + kind), Catatan: 'Expense notes' });
        if (kind === 'transfer') {
            await d.getByRole('button', { name: 'Simpan', exact: true }).click();
            assert(await d.getByText('Rekening tujuan wajib diisi untuk transaksi Transfer.', { exact: true }).isVisible());
            await d.getByLabel('Rekening Tujuan').fill('BCA Vendor 123456789');
        } else assert.equal(await d.getByLabel('Rekening Tujuan').count(), 0);
        await d.locator('input[type=file]').setInputFiles(path.join(root, 'fixtures/logo.png'));
        const record = await submit(d.getByRole('button', { name: 'Simpan', exact: true }), '/expenses', 201);
        state['expense_' + kind] = record;
        await persist('expenses', record.id, { transaction_type: kind, destination_account: kind === 'transfer' ? 'BCA Vendor 123456789' : null,
            expense_date: today, amount: 125000, vendor_id: state.vendor.id, source_account_id: state.account.id, category: 'Operasional',
            description: prefix('EXPENSE-' + kind), reference_number: prefix('EXPENSE-REF-' + kind), notes: 'Expense notes' }, '/expenses/' + record.id);
        assert(record.proof_url); assert.equal((await context.request.get(base + record.proof_url)).status(), 200);
        const cashbook = await api('GET', '/reports/cashbook?account_id=' + state.account.id);
        assert(cashbook.entries.some(e => e.id === 'expense-' + record.id && e.type === 'credit' && e.account_id === state.account.id && e.amount === 125000));
    });
    await test('Expense edit Transfer -> Cash -> Transfer, clear optional fields, cancel and reopen', async () => {
        const record = state.expense_transfer;
        await go('/pengeluaran'); await page.getByPlaceholder('Cari pengeluaran...').fill(prefix('EXPENSE-transfer'));
        await page.locator('tbody tr').getByRole('button', { name: 'Edit', exact: true }).click();
        const d = page.getByRole('dialog');
        await fillFields(d, { 'Jenis Transaksi': 'cash', Vendor: '', 'Nomor Referensi': '', Catatan: '', Keterangan: prefix('EXPENSE-transfer') + ' Updated', 'Nominal (Rp)': '175000' });
        await submit(d.getByRole('button', { name: 'Simpan', exact: true }), '/expenses/' + record.id);
        await persist('expenses', record.id, { transaction_type: 'cash', destination_account: null, vendor_id: null, reference_number: null, notes: null, amount: 175000 }, '/expenses/' + record.id);
        await page.getByPlaceholder('Cari pengeluaran...').fill(prefix('EXPENSE-transfer'));
        await page.locator('tbody tr').getByRole('button', { name: 'Edit', exact: true }).click();
        await d.getByLabel('Jenis Transaksi').selectOption('transfer');
        await d.getByRole('button', { name: 'Simpan', exact: true }).click();
        assert(await d.getByText(/Rekening tujuan wajib/).isVisible());
        await d.getByLabel('Rekening Tujuan').fill('Mandiri (QA)');
        await submit(d.getByRole('button', { name: 'Simpan', exact: true }), '/expenses/' + record.id);
        await persist('expenses', record.id, { destination_account: 'Mandiri (QA)', transaction_type: 'transfer' });
        await snap('expense');
        await page.getByRole('button', { name: 'Tambah Pengeluaran', exact: true }).click();
        await d.getByRole('button', { name: 'Simpan', exact: true }).click();
        await d.getByRole('button', { name: 'Batal', exact: true }).click();
        await page.getByRole('button', { name: 'Tambah Pengeluaran', exact: true }).click();
        assert.equal(await d.getByLabel('Keterangan').inputValue(), ''); assert.equal(await d.getByText(/Lengkapi/).count(), 0);
        await d.getByRole('button', { name: 'Tutup modal', exact: true }).click();
    });

    await test('Multiple invoice items, quantities, discount, UI/API/DB totals and unpaid PDF', async () => {
        await go('/invoice/create');
        await fillFields(page, { 'Nama Invoice': prefix('INVOICE-MULTI'), 'Tanggal Invoice': today, 'Jatuh Tempo': dateOffset(1) });
        await page.getByLabel('Klien', { exact: false }).selectOption(String(state.client.id));
        await page.getByLabel('Rekening Penerima').selectOption(String(state.account.id));
        await page.getByRole('button', { name: 'Tambah Item', exact: true }).click();
        await page.getByRole('button', { name: 'Tambah Item', exact: true }).click();
        for (let i = 0; i < 3; i++) {
            const input = page.getByPlaceholder('Deskripsi item').nth(i);
            await input.fill(`Item ${i + 1}: ` + 'Maintenance / Support (Indonesia) '.repeat(i === 2 ? 8 : 1));
            const grid = input.locator('xpath=../../..');
            await grid.locator('input[type=number]').nth(0).fill(String((i + 1) * 100000));
            await grid.locator('input[type=number]').nth(1).fill(String(i + 1));
        }
        await page.locator('aside input[type=number]').fill('100000');
        assert(await page.getByText(money(1300000), { exact: true }).isVisible());
        state.multi = await submit(page.getByRole('button', { name: 'Simpan & Terbitkan', exact: true }), '/invoices', 201);
        assert.equal(Number(state.multi.subtotal), 1400000); assert.equal(Number(state.multi.total), 1300000); assert.equal(state.multi.items.length, 3);
        for (const item of state.multi.items) assert.equal(Number(item.total), Number(item.price) * Number(item.qty));
        await page.waitForURL('**/invoice/' + state.multi.id); await page.reload(); await page.waitForLoadState('networkidle');
        await go('/invoice/' + state.multi.id + '/preview'); await assertImages(); await download('unpaid-multiple-discount-long-description');
    });
    await test('Long company/client/invoice text, description and terms remain readable in PDF', async () => {
        const client = await api('POST', '/clients', { name: 'PT Maju & Jaya / ' + 'Layanan Indonesia '.repeat(8),
            address: 'Jl. Pemeliharaan Sistem / Bandung (Jawa Barat), Indonesia', status: 'aktif' }, 201);
        const long = await api('POST', '/invoices', invoiceData({ client_id: client.id,
            invoice_name: prefix('INVOICE-LONG') + ' Pemeliharaan Sistem dan Dukungan'.repeat(5), document_status: 'published',
            payment_terms: 'Syarat pembayaran bertahap. '.repeat(20),
            items: [{ description: 'Maintenance / Support (Indonesia). '.repeat(30), price: 123000, qty: 2 }], discount: 6000,
        }), 201);
        await go('/invoice/' + long.id + '/preview'); await assertImages(); await download('long-name-description-terms');
    });

    await test('Billing A-F state matrix, overdue date boundaries, sequential unique numbers and cancellation', async () => {
        const matrix = {};
        for (const [key, overrides] of Object.entries({
            draft: { document_status: 'draft' }, unpaid: { document_status: 'published', due_date: today },
            partial: { document_status: 'published', due_date: dateOffset(1) }, paid: { document_status: 'published', due_date: today },
            overdue: { document_status: 'published', invoice_date: dateOffset(-5), due_date: dateOffset(-1) }, cancelled: { document_status: 'published' },
        })) {
            matrix[key] = await api('POST', '/invoices', invoiceData({ ...overrides, invoice_name: prefix('INVOICE-' + key) }), 201);
        }
        for (const key of ['partial', 'paid', 'overdue']) await api('POST', `/invoices/${matrix[key].id}/payments`, { payment_date: today,
            amount: key === 'paid' ? 1000000 : 100000, method: 'cash', account_id: state.account.id }, 201);
        await go('/invoice/' + matrix.cancelled.id);
        await page.getByRole('button', { name: 'Batalkan', exact: true }).click();
        await submit(page.getByRole('dialog').getByRole('button', { name: 'Batalkan', exact: true }), `/invoices/${matrix.cancelled.id}/cancel`);
        const list = await api('GET', '/billing?per_page=200');
        assert(!list.items.some(r => [matrix.draft.id, matrix.cancelled.id].includes(r.invoice.id)));
        for (const key of ['unpaid', 'partial', 'paid', 'overdue']) assert.equal(list.items.find(r => r.invoice.id === matrix[key].id).status, key);
        const numbers = Object.values(matrix).map(x => x.invoice_number); assert.equal(new Set(numbers).size, 6);
        const seqs = numbers.map(n => Number(n.split('/')[0])); for (let i = 1; i < seqs.length; i++) assert.equal(seqs[i], seqs[i - 1] + 1);
        state.matrix = matrix;
        await persist('invoices', matrix.cancelled.id, { document_status: 'cancelled' }, '/invoices/' + matrix.cancelled.id);
    });

    await test('Invoice invalid browser fields preserve form, API negative cases write nothing', async () => {
        await go('/invoice/create'); const count = db().invoices.length;
        await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
        assert(await page.getByText('Nama invoice wajib diisi.', { exact: true }).isVisible());
        await page.getByLabel('Nama Invoice').fill('PRESERVED NAME');
        await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
        assert.equal(await page.getByLabel('Nama Invoice').inputValue(), 'PRESERVED NAME');
        await fillFields(page, { 'Tanggal Invoice': today, 'Jatuh Tempo': dateOffset(1) });
        await page.getByLabel('Klien', { exact: false }).selectOption(String(state.client.id));
        await page.getByLabel('Rekening Penerima').selectOption(String(state.account.id));
        await page.locator('select').last().selectOption({ label: state.product.name });
        const item = page.locator('div.grid').filter({ has: page.getByPlaceholder('Deskripsi item') }).last();
        const numbers = item.locator('input[type=number]');
        for (const [price, qty] of [['1000', '0'], ['1000', '-1'], ['-1', '1'], ['0', '1']]) {
            await numbers.nth(0).fill(price); await numbers.nth(1).fill(qty);
            await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
            assert(await page.getByText('Lengkapi minimal satu item invoice.', { exact: true }).isVisible());
            assert.equal(await page.getByLabel('Nama Invoice').inputValue(), 'PRESERVED NAME');
            assert.equal(db().invoices.length, count);
        }
        await numbers.nth(0).fill('1000'); await numbers.nth(1).fill('1');
        for (const discount of ['-1', '1001']) {
            await page.locator('aside input[type=number]').fill(discount);
            await page.getByRole('button', { name: 'Simpan Draft', exact: true }).click();
            assert(await page.getByText(discount === '-1' ? 'Diskon tidak boleh negatif.' : 'Diskon tidak boleh melebihi subtotal.', { exact: true }).isVisible());
            assert.equal(db().invoices.length, count);
        }
        for (const invalid of [{ client_id: null }, { payment_account_id: null }, { due_date: null }, { items: [] },
            { discount: -1 }, { discount: 2000000 }, ...[0, -1].map(qty => ({ items: [{ description: 'Invalid', price: 1000, qty }] })),
            { items: [{ description: 'Invalid', price: 0, qty: 1 }] }]) await api('POST', '/invoices', invoiceData(invalid), 422);
        assert.equal(db().invoices.length, count);
    });

    await companySettings();
    await userLifecycle();
    await financialChecks();
    await securityAndResponsive(masters);
}

async function uploadApi(route, fields, files, status) {
    expectedStatus('POST', '/api' + route, status);
    const response = await page.evaluate(async ({ route, fields, files }) => {
        const form = new FormData();
        for (const [key, value] of Object.entries(fields)) form.append(key, value);
        for (const [key, value] of Object.entries(files)) {
            const bytes = Uint8Array.from(atob(value.bytes), c => c.charCodeAt(0));
            form.append(key, new File([bytes], value.name, { type: value.type }));
        }
        const xsrf = document.cookie.split('; ').find(x => x.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length);
        const r = await fetch('/api' + route, { method: 'POST', credentials: 'same-origin', body: form,
            headers: { Accept: 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } });
        return { status: r.status, body: await r.json() };
    }, { route, fields, files });
    assert.equal(response.status, status, JSON.stringify(response.body));
    assert.equal(response.body.success, status < 400); if (status === 422) assert(response.body.errors);
    return response.body.data;
}

async function companySettings() {
    await test('Company: all fields, logo/stamp/signature upload bytes, edit, DB/API/refresh persistence', async () => {
        await go('/data-perusahaan');
        const fields = { 'Nama Perusahaan': prefix('COMPANY') + ' PT Maju & Jaya', 'Kode Perusahaan': 'QA',
            'Nomor Telepon': '08123456789', Email: 'qa@example.test', Website: 'https://example.test', Alamat: 'Bandung / Jawa Barat (Indonesia)',
            'Nama Penanda Tangan': "O'Connor", Jabatan: 'Direktur', Tagline: 'Reliable Maintenance / Support', 'Kota Penandatanganan': 'Bandung' };
        await fillFields(page, fields);
        for (let i = 0; i < 3; i++) await page.locator('input[type=file]').nth(i).setInputFiles(path.join(root, 'fixtures', i === 0 ? 'logo.png' : 'signature.png'));
        state.company = await submit(page.getByRole('button', { name: 'Simpan Perubahan', exact: true }), '/company');
        await persist('companies', state.company.id, { name: fields['Nama Perusahaan'], code: 'QA', signer_title: 'Direktur', signing_city: 'Bandung',
            phone: fields['Nomor Telepon'], email: fields.Email, website: fields.Website, address: fields.Alamat,
            signer_name: fields['Nama Penanda Tangan'], tagline: fields.Tagline }, '/company');
        await assertImages();
        for (const field of ['logo', 'stamp', 'signature']) {
            const url = state.company[field + '_url']; assert(url.startsWith('/storage/browser-tests/'));
            const r = await context.request.get(base + url); assert.equal(r.status(), 200);
            assert.deepEqual(await r.body(), fs.readFileSync(path.join(root, 'fixtures', field === 'logo' ? 'logo.png' : 'signature.png')));
        }
        await page.getByLabel('Kota Penandatanganan').fill('Cimahi');
        await submit(page.getByRole('button', { name: 'Simpan Perubahan', exact: true }), '/company');
        await persist('companies', state.company.id, { signing_city: 'Cimahi' }, '/company'); await snap('company-images');
    });
    await test('Company/payment/expense invalid MIME and oversized file rejected without file or ledger mutation', async () => {
        const before = db();
        const textFile = { name: 'bad.txt', type: 'text/plain', bytes: Buffer.from('invalid QA proof').toString('base64') };
        await uploadApi('/company', { _method: 'PUT', name: state.company.name }, { logo: textFile }, 422);
        const oversized = { name: 'huge.png', type: 'image/png', bytes: Buffer.concat([fs.readFileSync(path.join(root, 'fixtures/logo.png')), Buffer.alloc(3 * 1024 * 1024)]).toString('base64') };
        await uploadApi('/company', { _method: 'PUT', name: state.company.name }, { logo: oversized }, 422);
        await uploadApi(`/invoices/${state.multi.id}/payments`, { payment_date: today, amount: '100', method: 'cash', account_id: String(state.account.id) }, { proof: textFile }, 422);
        await uploadApi('/expenses', { expense_date: today, amount: '100', category: 'Operasional', description: 'Invalid proof', source_account_id: String(state.account.id), transaction_type: 'cash' }, { proof: textFile }, 422);
        assert.equal(db().payments.length, before.payments.length); assert.equal(db().expenses.length, before.expenses.length);
        assert.equal(row('companies', state.company.id).logo_path, before.companies[0].logo_path);
    });
    const flags = [
        ['Logo Perusahaan', 'show_logo', () => page.locator('.invoice-document .invoice-header img')],
        ['Tagline / Deskripsi', 'show_tagline', () => page.locator('.invoice-document .invoice-tagline')],
        ['Judul Invoice', 'show_title', () => page.locator('.invoice-document h1')],
        ['Nomor Invoice', 'show_number', () => page.locator('.invoice-document section').first().getByText(/^No\./)],
        ['Tanggal Invoice', 'show_invoice_date', () => page.locator('.invoice-document').getByText('Invoice Date', { exact: true })],
        ['Tanggal Jatuh Tempo', 'show_due_date', () => page.locator('.invoice-document').getByText('Due Date', { exact: true })],
        ['Data Klien', 'show_client', () => page.locator('.invoice-document').getByText('Bill To:', { exact: true })],
        ['Rincian Item', 'show_items', () => page.locator('.invoice-document table')],
        ['Subtotal', 'show_subtotal', () => page.locator('.invoice-document').getByText('Subtotal', { exact: true })],
        ['Diskon', 'show_discount', () => page.locator('.invoice-document').getByText('Discount', { exact: true })],
        ['Total', 'show_total', () => page.locator('.invoice-document').getByText(/^Total Due:?$/)],
        ['Informasi Rekening Bank', 'show_bank_info', () => page.locator('.invoice-document').getByText('Payment Method:', { exact: true })],
        ['Terms & Conditions', 'show_terms', () => page.locator('.invoice-document').getByText('Terms & Condition:', { exact: true })],
        ['Cap Perusahaan', 'show_stamp', () => page.locator('.invoice-document img.grayscale')],
        ['Tanda Tangan', 'show_signature', () => page.locator('.invoice-document img.z-10')],
        ['Nama Penanda Tangan', 'show_signer_name', () => page.locator('.invoice-document').getByText("O'Connor", { exact: true })],
        ['Jabatan Penanda Tangan', 'show_signer_position', () => page.locator('.invoice-document').getByText('Direktur', { exact: true })],
    ];
    for (const [label, flag, target] of flags) await test('Template toggle ' + flag + ': preview and persistence', async () => {
        await go('/template-invoice');
        await page.getByRole('checkbox', { name: label, exact: true }).uncheck();
        assert.equal(await target().count(), 0, flag + ' remains visible in preview');
        const saved = await submit(page.getByRole('button', { name: 'Simpan Template', exact: true }), '/settings/invoice-template', 200, 'PUT');
        assert.equal(saved[flag], false, flag + ' save response');
        assert.equal(Boolean(db().invoice_template_settings[0][flag]), false, flag + ' DB immediately after save');
        await page.reload(); await page.waitForLoadState('networkidle');
        assert.equal(await page.getByRole('checkbox', { name: label, exact: true }).isChecked(), false);
        assert.equal((await api('GET', '/settings/invoice-template'))[flag], false);
        assert.equal(Boolean(db().invoice_template_settings[0][flag]), false);
        await page.getByRole('checkbox', { name: label, exact: true }).check();
        await submit(page.getByRole('button', { name: 'Simpan Template', exact: true }), '/settings/invoice-template', 200, 'PUT');
    });
    await snap('template-all-flags-restored');
    await test('Numbering supported options change future number only; unique immutable historical numbers', async () => {
        await go('/penomoran-invoice');
        await fillFields(page, { 'Kode Dokumen': 'QA', 'Kode Perusahaan': 'TEST', 'Digit Nomor': '5', 'Format Bulan': 'angka', 'Format Tahun': '4digit', 'Reset Urutan': 'continuous' });
        await submit(page.getByRole('button', { name: 'Simpan', exact: true }), '/settings/invoice-numbering', 200, 'PUT');
        await page.reload(); await page.waitForLoadState('networkidle'); assert.equal(await page.getByLabel('Digit Nomor').inputValue(), '5');
        const created = await api('POST', '/invoices', invoiceData(), 201);
        assert(new RegExp(`^\\d{5}/QA/TEST/${today.slice(5, 7)}/${today.slice(0, 4)}$`).test(created.invoice_number));
        assert.equal(row('invoices', state.invoice.id).invoice_number, state.invoice.invoice_number);
        await snap('numbering-persisted');
    });
}

async function userLifecycle() {
    await test('Users: full create, optional email, validation correction, edit all fields, status and inactive login', async () => {
        await go('/pengguna'); await page.getByRole('button', { name: 'Tambah Pengguna', exact: true }).click();
        const d = page.getByRole('dialog');
        await d.getByRole('button', { name: 'Simpan', exact: true }).click(); assert(await d.getByText(/wajib diisi/).count() > 0);
        await fillFields(d, { 'Nama Lengkap': prefix('USER'), Username: prefix('USER'), Email: 'invalid-email', Password: 'short', Role: 'manager', Status: 'aktif' });
        await d.getByRole('button', { name: 'Simpan', exact: true }).click(); assert(await d.getByText(/email|karakter/i).count() > 0);
        await d.getByLabel('Email', { exact: true }).fill(''); await d.getByLabel('Password', { exact: false }).fill('Browser-test-123!');
        state.user = await submit(d.getByRole('button', { name: 'Simpan', exact: true }), '/users', 201);
        await persist('users', state.user.id, { username: prefix('USER'), email: null, role: 'manager' }, '/users/' + state.user.id);
        await api('POST', '/users', { name: 'Duplicate', username: prefix('USER'), role: 'manager', password: 'Browser-test-123!' }, 422);
        for (const invalid of [{ role: 'superadmin' }, { password: 'short' }, { email: 'bad' }, { name: '' }]) {
            await api('POST', '/users', { name: 'Invalid', username: prefix('USER-INVALID'), role: 'manager', password: 'Browser-test-123!', ...invalid }, 422);
        }
        await page.getByRole('button', { name: 'Aksi ' + state.user.name, exact: true }).click();
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        await fillFields(d, { 'Nama Lengkap': prefix('USER') + ' Updated', Username: prefix('USER') + '-updated', Email: 'user-' + runId + '@example.test', Role: 'admin', Status: 'nonaktif' });
        await submit(d.getByRole('button', { name: 'Simpan', exact: true }), '/users/' + state.user.id, 200, 'PUT');
        await persist('users', state.user.id, { role: 'admin', status: 'nonaktif', username: prefix('USER') + '-updated' }, '/users/' + state.user.id);
        const adminContext = context, adminPage = page;
        context = await browser.newContext({ timezoneId: 'Asia/Jakarta' });
        await context.clock.setFixedTime(new Date('2026-11-17T05:00:00Z'));
        page = await context.newPage(); watch(page);
        await login(prefix('USER') + '-updated', 'Browser-test-123!', 422);
        assert(await page.getByText('Akun tidak aktif.', { exact: true }).isVisible()); await context.close();
        context = adminContext; page = adminPage;
        await api('PATCH', '/users/' + state.user.id + '/status', {});
        assert.equal(row('users', state.user.id).status, 'aktif');
        await api('PATCH', '/users/' + state.user.id + '/status', {});
        const me = await api('GET', '/me');
        await api('PUT', '/users/' + me.id, { name: me.name, username: me.username, role: 'manager' }, 422);
        await api('PUT', '/users/' + me.id, { name: me.name, username: me.username, role: 'admin', status: 'nonaktif' }, 422);
        await api('PATCH', '/users/' + me.id + '/status', {}, 422);
        assert.equal(row('users', me.id).status, 'aktif');
        await snap('users-persisted');
    });
}

async function dashboardCheck(role) {
    const data = db(); await go('/dashboard');
    for (const period of ['Bulan Ini', '3 Bulan Terakhir', 'Tahun Ini']) {
        await page.locator('main select').selectOption(period);
        const month = Number(today.slice(5, 7));
        const keys = period === 'Bulan Ini' ? [today.slice(0, 7)] : period === '3 Bulan Terakhir'
            ? [0, -1, -2].map(m => dateOffset(0, m).slice(0, 7))
            : Array.from({ length: month }, (_, i) => today.slice(0, 4) + '-' + String(i + 1).padStart(2, '0'));
        const inside = date => keys.includes(date?.slice(0, 7));
        const invoices = data.invoices.filter(i => inside(i.invoice_date));
        const paid = id => data.payments.filter(p => p.invoice_id === id).reduce((s, p) => s + Number(p.amount), 0);
        const values = {
            'Total Invoice': invoices.filter(i => i.document_status !== 'cancelled').length,
            'Sisa Tagihan': money(invoices.filter(i => i.document_status === 'published').reduce((s, i) => s + Number(i.total) - paid(i.id), 0)),
            'Total Pemasukan': money(data.incomes.filter(i => inside(i.income_date)).reduce((s, i) => s + Number(i.amount), 0)),
            'Total Pengeluaran': money(data.expenses.filter(e => inside(e.expense_date)).reduce((s, e) => s + Number(e.amount), 0)),
        };
        for (const [label, value] of Object.entries(values)) {
            const card = page.locator('main button').filter({ has: page.getByText(label, { exact: true }) });
            assert.equal(await card.locator('p').nth(1).innerText(), String(value), role + ' dashboard ' + period + ' ' + label);
        }
        assert.equal(await page.locator('svg text').count(), keys.length, 'Chart must use the same calendar period');
        const recentNumbers = await page.locator('tbody tr td:first-child').allTextContents();
        assert(recentNumbers.every(number => invoices.some(i => i.invoice_number === number)));
        if (period === 'Bulan Ini') await snap('dashboard-' + role);
    }
    await page.reload(); await page.waitForLoadState('networkidle');
}

async function financialChecks() {
    await test('Date boundary fixtures: previous year, January, prior months, month start/end', async () => {
        const dates = [...new Set([today.slice(0, 4) + '-01-01', (Number(today.slice(0, 4)) - 1) + '-12-31', dateOffset(0, -2), today.slice(0, 7) + '-01'])];
        for (let i = 0; i < dates.length; i++) await api('POST', '/incomes', { income_date: dates[i], source: 'Boundary QA',
            category: 'Pendapatan Lainnya', description: prefix('INCOME-BOUNDARY-' + i), amount: (i + 1) * 10000, account_id: state.account.id }, 201);
        const previous = await api('POST', '/invoices', invoiceData({ document_status: 'published', invoice_date: dateOffset(0, -1), due_date: dateOffset(2, -1) }), 201);
        await api('POST', `/invoices/${previous.id}/payments`, { payment_date: dateOffset(0, -1), amount: 12000, method: 'cash', account_id: state.account.id }, 201);
    });
    await test('Dashboard periods, chart and recent invoice cross-check against database', () => dashboardCheck('admin'));
    await test('Reports all five tabs: date + account + search; debit/credit/balance vs DB and API', async () => {
        const from = today.slice(0, 4) + '-01-01', to = today;
        const data = db(); const within = date => date >= from && date <= to;
        const incomes = data.incomes.filter(i => i.account_id === state.account.id && within(i.income_date));
        const expenses = data.expenses.filter(e => e.source_account_id === state.account.id && within(e.expense_date));
        const debit = incomes.reduce((s, i) => s + Number(i.amount), 0), credit = expenses.reduce((s, e) => s + Number(e.amount), 0);
        const cashbook = await api('GET', `/reports/cashbook?from=${from}&to=${to}&account_id=${state.account.id}`);
        assert.equal(cashbook.debit, debit); assert.equal(cashbook.credit, credit); assert.equal(cashbook.balance, debit - credit);
        assert.equal(cashbook.entries.length, incomes.length + expenses.length);
        await go('/laporan'); await page.getByLabel('Tanggal Awal').fill(from); await page.getByLabel('Tanggal Akhir').fill(to);
        await page.getByLabel('Rekening', { exact: true }).selectOption(String(state.account.id));
        for (const [label, amount] of [['Total Debit (Masuk)', debit], ['Total Kredit (Keluar)', credit], ['Saldo', debit - credit]]) {
            const container = page.getByText(label, { exact: true }).locator('..');
            assert.equal(await container.locator('p').last().innerText(), money(amount));
        }
        await snap('reports-cross-check');
        for (const [label, endpoint, table, date, account] of [
            ['Invoice', 'invoices', 'invoices', 'invoice_date', 'payment_account_id'], ['Pembayaran', 'payments', 'payments', 'payment_date', 'account_id'],
            ['Pemasukan', 'incomes', 'incomes', 'income_date', 'account_id'], ['Pengeluaran', 'expenses', 'expenses', 'expense_date', 'source_account_id'],
        ]) {
            await page.locator('.report-page').getByRole('button', { name: label, exact: true }).click();
            const apiRows = await api('GET', `/reports/${endpoint}?from=${from}&to=${to}&account_id=${state.account.id}`);
            assert.equal(apiRows.length, data[table].filter(r => r[account] === state.account.id && within(r[date])).length);
            await page.getByLabel('Cari', { exact: true }).fill('no-such-' + runId);
            assert.equal(await page.locator('tbody tr').filter({ hasText: 'Tidak ada data' }).count(), 1);
            await page.getByLabel('Cari', { exact: true }).fill('');
        }
        await page.getByLabel('Tanggal Awal').fill(dateOffset(5));
        assert(await page.getByText('Tanggal awal tidak boleh melewati tanggal akhir.', { exact: true }).isVisible());
    });

    await test('Payments search + method/account/current/previous month filters and details modal', async () => {
        await go('/pembayaran');
        const selects = page.locator('main select');
        await selects.nth(2).selectOption(String(state.account.id));
        assert(await page.locator('tbody').getByText(state.account.name, { exact: true }).count() > 0);
        await selects.nth(0).selectOption('bulan_lalu');
        const dates = await page.locator('tbody tr td:first-child').allTextContents();
        assert(dates.length > 0 && !dates.some(d => d.includes('Belum ada')));
        const expectedMonth = new Date(dateOffset(0, -1) + 'T12:00:00').toLocaleDateString('id-ID', { month: 'short' });
        assert(dates.every(d => d.toLowerCase().includes(expectedMonth.toLowerCase())));
        await selects.nth(0).selectOption('bulan_ini'); await selects.nth(1).selectOption('Transfer Bank');
        await page.getByPlaceholder('Cari invoice, klien...').fill(state.invoice.invoice_number);
        assert.equal(await page.locator('tbody tr').count(), 3);
        await page.getByRole('button', { name: 'Detail', exact: true }).first().click();
        assert(await page.getByRole('dialog', { name: 'Detail Pembayaran' }).isVisible());
        await page.getByRole('dialog').getByRole('button', { name: 'Tutup modal', exact: true }).click();
    });

    await test('Pagination across invoice, Billing, payments, income, expenses and reports', async () => {
        for (const route of ['/invoice', '/billing', '/pembayaran', '/pemasukan', '/pengeluaran']) await paginate(route);
        await go('/laporan'); await page.getByLabel('Tanggal Awal').fill(today.slice(0, 4) + '-01-01');
        const next = page.getByRole('button', { name: 'Halaman berikutnya', exact: true });
        assert(await next.isEnabled()); await next.click(); await page.getByRole('button', { name: 'Halaman sebelumnya', exact: true }).click();
    });

    await test('Historical integrity after master edits/deactivation; active-only new selectors', async () => {
        const snapshot = (await api('GET', '/invoices/' + state.invoice.id)).items;
        await api('PUT', '/products-services/' + state.product.id, { name: state.product.name + ' Master Rename', description: 'New master description', default_price: 999, unit: 'hour', status: 'aktif' });
        assert.deepEqual((await api('GET', '/invoices/' + state.invoice.id)).items, snapshot);
        for (const [endpoint, id] of [['clients', state.client.id], ['vendors', state.vendor.id], ['products-services', state.product.id], ['accounts', state.account.id]]) {
            await api('PATCH', `/${endpoint}/${id}/status`, {});
        }
        await go('/invoice/create');
        assert.equal(await page.getByLabel('Klien', { exact: false }).locator(`option[value="${state.client.id}"]`).count(), 0);
        assert.equal(await page.getByLabel('Rekening Penerima').locator(`option[value="${state.account.id}"]`).count(), 0);
        await go('/invoice/' + state.invoice.id);
        assert(await page.getByText(state.client.name, { exact: true }).count() > 0);
        await go('/pengeluaran'); await page.getByPlaceholder('Cari pengeluaran...').fill(state.expense_cash.description);
        assert(await page.locator('tbody').getByText(state.vendor.name, { exact: true }).isVisible());
        assert(await page.locator('tbody').getByText(state.account.name, { exact: true }).isVisible());
        await go('/pemasukan'); await page.getByPlaceholder('Cari pemasukan...').fill(row('incomes', state.income.id).description);
        assert(await page.locator('tbody').getByText(state.account.name, { exact: true }).isVisible());
        assert((await api('GET', `/clients/${state.client.id}/invoices`)).some(i => i.id === state.invoice.id));
        assert((await api('GET', `/vendors/${state.vendor.id}/expenses`)).some(e => e.id === state.expense_cash.id));
        for (const [endpoint, id] of [['clients', state.client.id], ['vendors', state.vendor.id], ['products-services', state.product.id], ['accounts', state.account.id]]) await api('PATCH', `/${endpoint}/${id}/status`, {});
        state.product = await api('GET', '/products-services/' + state.product.id);
    });

    await test('Concurrent payments 800k + 800k against 1m and concurrent invoice sequences', async () => {
        const invoice = await api('POST', '/invoices', invoiceData({ document_status: 'published', invoice_name: prefix('INVOICE-CONCURRENT') }), 201);
        const payments = await concurrency('payment', invoice.id, 2);
        assert.deepEqual(payments.map(p => p.status).sort(), [201, 422]);
        const rows = db().payments.filter(p => p.invoice_id === invoice.id); assert.equal(rows.length, 1); assert.equal(Number(rows[0].amount), 800000);
        const invoices = await concurrency('invoice', invoice.id, 4); assert(invoices.every(i => i.status === 201));
        assert.equal(new Set(invoices.map(i => i.number)).size, 4);
        state.concurrency = { payments, invoices };
    });
    await doubleSubmitTests();

    await test('Beyond first API page: >100 clients and >200 incomes survive refresh and re-login', async () => {
        const seeded = spawnSync('php', ['tests/browser/database.php', '--volume', runId, String(state.account.id)], { encoding: 'utf8', env: process.env });
        assert.equal(seeded.status, 0, seeded.stderr);
        await go('/klien'); await page.getByPlaceholder('Cari klien...').fill('ZZZ-E2E-CLIENT-VOLUME-' + runId + '-104');
        assert(await page.locator('tbody').getByText('ZZZ-E2E-CLIENT-VOLUME-' + runId + '-104', { exact: true }).isVisible());
        await go('/pemasukan'); await page.getByPlaceholder('Cari pemasukan...').fill('E2E-INCOME-VOLUME-' + runId + '-204');
        assert(await page.locator('tbody').getByText('E2E-INCOME-VOLUME-' + runId + '-204', { exact: true }).isVisible());
        await logout(); await login('admin');
        await page.getByRole('navigation').getByRole('button', { name: 'Pemasukan', exact: true }).click();
        await page.waitForLoadState('networkidle');
        await page.getByPlaceholder('Cari pemasukan...').fill('E2E-INCOME-VOLUME-' + runId + '-204');
        assert(await page.locator('tbody').getByText('E2E-INCOME-VOLUME-' + runId + '-204', { exact: true }).isVisible());
    });

    await test('Final relational/financial integrity: FK, snapshots, arithmetic, payments exactly one matching income', async () => {
        const data = db(); assert.deepEqual(data.foreign_key_check, []);
        assert.equal(new Set(data.invoices.map(i => i.invoice_number)).size, data.invoices.length);
        for (const invoice of data.invoices) {
            const items = data.invoice_items.filter(i => i.invoice_id === invoice.id);
            const sum = items.reduce((s, i) => s + Number(i.total), 0);
            assert.equal(sum, Number(invoice.subtotal)); assert.equal(Number(invoice.total), sum - Number(invoice.discount));
            assert(data.payments.filter(p => p.invoice_id === invoice.id).reduce((s, p) => s + Number(p.amount), 0) <= Number(invoice.total));
        }
        for (const payment of data.payments) {
            assert(Number(payment.amount) > 0); assert(data.invoices.some(i => i.id === payment.invoice_id));
            const incomes = data.incomes.filter(i => i.payment_id === payment.id); assert.equal(incomes.length, 1);
            for (const field of ['amount', 'invoice_id', 'account_id']) assert.equal(incomes[0][field], payment[field]);
            assert.equal(incomes[0].income_date, payment.payment_date);
        }
        for (const item of data.invoice_items) { assert(data.invoices.some(i => i.id === item.invoice_id)); assert.equal(Number(item.total), Number(item.price) * Number(item.qty)); }
        for (const income of data.incomes) {
            assert(data.accounts.some(a => a.id === income.account_id));
            if (income.source_type === 'invoice') assert(data.payments.some(p => p.id === income.payment_id));
            else { assert.equal(income.payment_id, null); assert.equal(income.invoice_id, null); }
        }
        for (const expense of data.expenses) {
            assert(expense.transaction_type === 'transfer' ? Boolean(expense.destination_account) : expense.destination_account === null);
        }
        fs.writeFileSync(path.join(root, 'json/database-snapshot.json'), JSON.stringify(data, null, 2));
    });
}

async function doubleSubmitTests() {
    for (const kind of ['income', 'expense', 'invoice', 'payment']) await test('Rapid double submit ' + kind + ': exactly one persisted operation', async () => {
        let endpoint, table, button;
        if (kind === 'income' || kind === 'expense') {
            const income = kind === 'income'; await go(income ? '/pemasukan' : '/pengeluaran');
            await page.getByRole('button', { name: income ? 'Tambah Pemasukan' : 'Tambah Pengeluaran', exact: true }).click();
            const d = page.getByRole('dialog');
            await fillFields(d, { Tanggal: today, 'Nominal (Rp)': '700', Keterangan: prefix(kind.toUpperCase() + '-DOUBLE') });
            if (income) { await d.getByLabel('Kategori').fill('Pendapatan Lainnya'); await d.getByLabel('Rekening', { exact: true }).selectOption(String(state.account.id)); }
            else { await d.getByLabel('Kategori').selectOption('Operasional'); await d.getByLabel('Rekening Sumber').selectOption(String(state.account.id)); }
            endpoint = income ? '/incomes' : '/expenses'; table = income ? 'incomes' : 'expenses';
            button = d.getByRole('button', { name: 'Simpan', exact: true });
        } else if (kind === 'invoice') {
            await go('/invoice/create');
            await fillFields(page, { 'Nama Invoice': prefix('INVOICE-DOUBLE'), 'Tanggal Invoice': today, 'Jatuh Tempo': dateOffset(1) });
            await page.getByLabel('Klien', { exact: false }).selectOption(String(state.client.id));
            await page.getByLabel('Rekening Penerima').selectOption(String(state.account.id));
            await page.locator('select').last().selectOption({ label: state.product.name });
            button = page.getByRole('button', { name: 'Simpan Draft', exact: true }); endpoint = '/invoices'; table = 'invoices';
        } else {
            await go('/invoice/' + state.matrix.partial.id); await page.getByRole('button', { name: 'Catat Pembayaran', exact: true }).click();
            await page.getByRole('dialog').getByLabel('Nominal (Rp)').fill('100');
            button = page.getByRole('button', { name: 'Simpan Pembayaran', exact: true }); endpoint = `/invoices/${state.matrix.partial.id}/payments`; table = 'payments';
        }
        const before = db()[table].length;
        const matcher = base + '/api' + endpoint;
        await page.route(matcher, async route => { await new Promise(resolve => setTimeout(resolve, 350)); await route.continue(); });
        const response = page.waitForResponse(r => r.url() === matcher && r.request().method() === 'POST');
        await button.evaluate(el => { el.click(); el.click(); });
        if (kind !== 'invoice') assert(await button.isDisabled(), kind + ' save button stays disabled while saving');
        assert.equal((await response).status(), 201); await page.waitForLoadState('networkidle'); await page.unroute(matcher);
        assert.equal(db()[table].length - before, 1, kind + ' duplicate records from one rapid double click');
    });
}

async function securityAndResponsive(masters) {
    await test('Logout/back/forward and re-login: financial records persist across sessions', async () => {
        const before = db(); await go('/invoice'); await logout();
        expectedStatus('GET', '/api/me', 401);
        await page.goBack(); await page.waitForLoadState('networkidle');
        await page.waitForURL('**/login');
        assert.equal(new URL(page.url()).pathname, '/login');
        expectedStatus('GET', '/api/me', 401);
        await page.goForward(); await page.waitForLoadState('networkidle');
        assert.equal(new URL(page.url()).pathname, '/login');
        await api('GET', '/invoices', undefined, 401);
        await login('admin');
        const after = db();
        for (const table of ['payments', 'incomes', 'expenses', 'invoices']) assert.equal(after[table].length, before[table].length);
        assert.equal((await api('GET', '/billing/' + state.invoice.id)).status, 'paid');
    });

    const routes = ['/dashboard', '/klien', '/vendor', '/produk-layanan', '/rekening', '/invoice', '/invoice/create', '/invoice/' + state.invoice.id,
        '/billing', '/pembayaran', '/pemasukan', '/pengeluaran', '/laporan', '/data-perusahaan', '/template-invoice', '/penomoran-invoice', '/pengguna'];
    const viewports = [[1920, 1080], [1366, 768], [1024, 768], [768, 1024], [390, 844]];
    if (process.env.FULL_QA_PHASE) viewports.reverse();
    for (const [width, height] of viewports) {
        await test(`Responsive ${width}x${height}: all critical admin pages, sidebar and expense modal`, async () => {
            await page.setViewportSize({ width, height });
            const overflows = [];
            for (const route of routes) {
                await go(route); assert.notEqual(new URL(page.url()).pathname, '/login');
                assert(await page.locator('main').first().isVisible());
                const overflow = await page.evaluate(() => ({ body: document.documentElement.scrollWidth - innerWidth,
                    main: [...document.querySelectorAll('main')].map(el => el.scrollWidth - el.clientWidth) }));
                if (overflow.body > 1 || overflow.main.some(v => v > 1)) {
                    overflows.push({ route, ...overflow });
                    await snap('overflow-' + width + route.replaceAll('/', '-'));
                }
                console.log('CHECK responsive', width, route, JSON.stringify(overflow));
            }
            assert.deepEqual(overflows, [], 'Horizontal page overflow at ' + width);
            await go('/pengeluaran'); await page.getByRole('button', { name: 'Tambah Pengeluaran', exact: true }).click();
            const d = page.getByRole('dialog'); await d.getByLabel('Jenis Transaksi').selectOption('transfer');
            assert(await d.getByLabel('Rekening Tujuan').isVisible());
            await d.getByRole('button', { name: 'Simpan', exact: true }).click(); assert(await d.getByText(/Lengkapi/).isVisible());
            const rect = await d.boundingBox(); assert(rect.width <= width && rect.x >= 0);
            await d.getByLabel('Jenis Transaksi').selectOption('cash'); assert.equal(await d.getByLabel('Rekening Tujuan').count(), 0);
            await snap('expense-modal-' + width);
            await d.getByRole('button', { name: 'Tutup modal', exact: true }).click();
            if (width < 1024) {
                const menu = page.getByRole('button', { name: 'Buka navigasi', exact: true });
                await menu.click(); await page.getByRole('navigation').getByRole('button', { name: 'Dashboard', exact: true }).click();
                await page.waitForURL('**/dashboard'); await page.waitForLoadState('networkidle');
                await snap('mobile-dashboard-' + width);
            }
        });
    }
    await page.setViewportSize({ width: 1366, height: 768 });
    await logout(); await context.close();
    await freshContext('manager');
    await test('Manager authentication persistence, all read routes, dashboard metrics and hidden write controls', async () => {
        assert.equal((await api('GET', '/me')).role, 'manager');
        for (const route of routes.filter(r => !['/invoice/create', '/pengguna'].includes(r))) {
            await go(route); assert.notEqual(new URL(page.url()).pathname, '/login');
            assert.equal(await page.getByRole('button', { name: /^(Tambah |Simpan Perubahan|Simpan Template|Terbitkan|Buat Invoice|Catat Pembayaran)/ }).count(), 0);
        }
        await dashboardCheck('manager'); await snap('manager-dashboard');
        await go('/invoice/' + state.invoice.id + '/preview'); await assertImages(); await download('golden-paid-manager');
        const print = await context.request.get(base + '/invoice/' + state.invoice.id + '/print');
        assert.equal(print.status(), 200); assert.equal((await print.body()).subarray(0, 5).toString(), '%PDF-');
        await snap('manager-preview');
    });
    for (const m of masters) await test(`Manager ${m.kind}: search, filter, pagination and history`, async () => {
        const record = state[m.state];
        await checkSearch(m.route, record.name, record.name);
        await paginate(m.route);
        await go(m.route); await page.locator('main select').first().selectOption('nonaktif');
        assert(await page.locator('tbody').getByText('Nonaktif', { exact: true }).count() > 0);
        if (['client', 'vendor'].includes(m.state)) {
            await page.locator('main select').first().selectOption('semua');
            await page.getByPlaceholder(/^Cari/).fill(record.name);
            await page.getByRole('button', { name: 'Aksi ' + record.name, exact: true }).click();
            await page.getByRole('button', { name: m.state === 'client' ? 'Riwayat Invoice' : 'Riwayat Transaksi', exact: true }).click();
            assert(await page.getByRole('dialog').isVisible());
            await page.getByRole('dialog').getByRole('button', { name: 'Tutup', exact: true }).click();
        }
    });
    await test('Manager finance filters and invoice/Billing/payment pagination', async () => {
        await go('/pemasukan');
        await page.locator('main select').filter({ has: page.locator('option', { hasText: 'Semua Rekening' }) }).selectOption(String(state.account.id));
        assert(await page.locator('tbody').getByText(state.account.name, { exact: true }).count() > 0);
        await go('/pengeluaran');
        await page.locator('main select').filter({ has: page.locator('option', { hasText: 'Semua Vendor' }) }).selectOption(String(state.vendor.id));
        assert(await page.locator('tbody').getByText(state.vendor.name, { exact: true }).count() > 0);
        for (const route of ['/invoice', '/billing', '/pembayaran', '/pemasukan', '/pengeluaran']) await paginate(route);
    });
    const writes = [];
    for (const m of masters) writes.push(['POST', m.api], ['PUT', m.api + '/' + state[m.state].id], ['PATCH', m.api + '/' + state[m.state].id + '/status']);
    writes.push(['POST', '/invoices'], ['PUT', '/invoices/' + state.invoice.id], ['POST', '/invoices/' + state.invoice.id + '/publish'],
        ['POST', '/invoices/' + state.invoice.id + '/cancel'], ['POST', '/invoices/' + state.invoice.id + '/payments'], ['POST', '/incomes'], ['PUT', '/incomes/' + state.income.id],
        ['POST', '/expenses'], ['PUT', '/expenses/' + state.expense_cash.id], ['PUT', '/company'], ['PUT', '/settings/invoice-template'], ['PUT', '/settings/invoice-numbering'],
        ['GET', '/users'], ['GET', '/users/' + state.user.id], ['POST', '/users'], ['PUT', '/users/' + state.user.id], ['PATCH', '/users/' + state.user.id + '/status']);
    for (const [method, route] of writes) await test('Manager direct HTTP denied: ' + method + ' ' + route.replace(/\d+/g, ':id'), async () => {
        const before = db(); await api(method, route, method === 'GET' ? undefined : {}, 403);
        assert.deepEqual(db(), before, 'Forbidden request changed the database');
    });
    await test('Manager forbidden URLs, mobile view, logout and expired/invalid session', async () => {
        for (const route of ['/pengguna', '/invoice/create', '/invoice/' + state.invoice.id + '/edit']) {
            await go(route); assert(['/dashboard', '/invoice'].includes(new URL(page.url()).pathname));
        }
        await snap('manager-forbidden-route');
        await page.setViewportSize({ width: 390, height: 844 }); await go('/dashboard'); await snap('manager-mobile-dashboard');
        await page.setViewportSize({ width: 1366, height: 768 }); await logout();
        await login('manager'); await context.clearCookies(); authenticatedContexts.set(context, false);
        await api('GET', '/me', undefined, 401);
        await go('/dashboard'); assert.equal(new URL(page.url()).pathname, '/login');
        const print = await context.request.get(base + '/invoice/' + state.invoice.id + '/print', { maxRedirects: 0 });
        assert.equal(print.status(), 302); assert(print.headers().location.endsWith('/login'));
    });
    for (const route of routes.filter(r => !r.includes('/invoice/'))) await test('Guest direct URL and API protected: ' + route, async () => {
        await go(route); assert.equal(new URL(page.url()).pathname, '/login');
    });
    for (const route of ['/me', '/clients', '/vendors', '/products-services', '/accounts', '/invoices', '/billing', '/payments', '/incomes', '/expenses',
        '/company', '/users', '/settings/invoice-template', '/settings/invoice-numbering', '/reports/cashbook', '/reports/invoices', '/reports/payments', '/reports/incomes', '/reports/expenses']) {
        await test('Guest direct API 401: ' + route, () => api('GET', route, undefined, 401));
    }
    for (const [width, height] of [[1920, 1080], [1366, 768], [1024, 768], [768, 1024], [390, 844]]) await test('Login responsive ' + width, async () => {
        await page.setViewportSize({ width, height }); await go('/login');
        assert(await page.getByRole('button', { name: 'Masuk', exact: true }).isVisible());
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    });
    await test('Browser/network final health: zero unexpected errors or failed HTTP responses', async () => {
        assert.deepEqual(errors, []); assert.deepEqual(network.filter(r => !r.expected || r.status >= 500), []);
    });
    await context.close();
}

run().catch(async error => {
    console.error(error.stack); saveEvidence(); if (browser) await browser.close(); process.exitCode = 1;
});
