<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Download, Printer, Search } from 'lucide-vue-next';
import { useInvoiceStore } from '@/stores/invoice';
import { usePaymentStore } from '@/stores/payment';
import { useFinanceStore } from '@/stores/finance';
import { useMasterDataStore } from '@/stores/masterData';
import settingsService from '@/services/settingsService';
import { formatCurrency, formatDate, todayIso } from '@/utils/formatters';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import Pagination from '@/components/ui/Pagination.vue';

const invoices = useInvoiceStore(); const payments = usePaymentStore(); const finance = useFinanceStore(); const masterData = useMasterDataStore();
const company = ref(null); const ready = ref(false); const loadError = ref(false);
const tab = ref('debit-kredit'); const start = ref(`${todayIso().slice(0, 7)}-01`); const end = ref(todayIso()); const account = ref('semua'); const search = ref(''); const page = ref(1); const pageSize = 8;
onMounted(async () => {
    try {
        const [, , , , companyData] = await Promise.all([invoices.ensure(), payments.ensure(), finance.ensure(), masterData.ensureAll(), settingsService.getCompany()]);
        company.value = companyData;
        ready.value = true;
    } catch {
        loadError.value = true;
    }
});
const accounts = computed(() => masterData.accounts);
const tabs = [['debit-kredit', 'Keuangan / Debit & Kredit'], ['invoice', 'Invoice'], ['pembayaran', 'Pembayaran'], ['pemasukan', 'Pemasukan'], ['pengeluaran', 'Pengeluaran']];
const validRange = computed(() => !start.value || !end.value || start.value <= end.value);
const matches = (entry) => entry.date >= start.value && entry.date <= end.value && (account.value === 'semua' || String(entry.accountId) === String(account.value)) && entry.description.toLowerCase().includes(search.value.toLowerCase());
const cashbook = computed(() => finance.cashbookEntries.filter(matches).sort((left, right) => left.date.localeCompare(right.date)));
const debit = computed(() => cashbook.value.filter((entry) => entry.type === 'debit').reduce((total, entry) => total + entry.amount, 0));
const credit = computed(() => cashbook.value.filter((entry) => entry.type === 'credit').reduce((total, entry) => total + entry.amount, 0));
const balance = computed(() => debit.value - credit.value);
const rows = computed(() => cashbook.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const reportTitle = computed(() => ({ 'debit-kredit': 'Buku Kas — Debit & Kredit', invoice: 'Laporan Invoice', pembayaran: 'Laporan Pembayaran', pemasukan: 'Laporan Pemasukan', pengeluaran: 'Laporan Pengeluaran' }[tab.value]));
const entityRows = computed(() => {
    const entries = tab.value === 'invoice'
        ? invoices.invoices.map((invoice) => ({ id: invoice.id, date: invoice.date, description: `${invoice.number} — ${invoice.client}`, amount: payments.paymentSummaryByInvoice(invoice).total, accountId: invoice.accountId, type: 'invoice' }))
        : tab.value === 'pembayaran'
            ? payments.payments.map((payment) => ({ id: payment.id, date: payment.paymentDate, description: payment.referenceNumber || 'Pembayaran Invoice', amount: payment.amount, accountId: payment.accountId, type: 'pembayaran' }))
            : tab.value === 'pemasukan'
                ? finance.allIncomes.map((income) => ({ id: income.id, date: income.date, description: income.description, amount: income.amount, accountId: income.accountId, type: 'pemasukan' }))
                : finance.expenses.map((expense) => ({ id: expense.id, date: expense.date, description: expense.description, amount: expense.amount, accountId: expense.sourceAccountId || '', type: 'pengeluaran' }));
    return entries.filter(matches);
});
const simpleRows = computed(() => entityRows.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const reportRows = computed(() => tab.value === 'debit-kredit' ? cashbook.value : entityRows.value);
const reportTotal = computed(() => entityRows.value.reduce((total, row) => total + Number(row.amount || 0), 0));
const accountLabel = computed(() => account.value === 'semua' ? 'Semua rekening' : accounts.value.find((item) => String(item.id) === String(account.value))?.nama || 'Rekening terpilih');
const periodLabel = computed(() => `${start.value ? formatDate(start.value) : 'Awal'} - ${end.value ? formatDate(end.value) : 'Akhir'}`);
const sourceLabel = (row) => row.type === 'debit' ? (row.source === 'invoice' ? 'Pembayaran Invoice' : 'Pemasukan Manual') : row.type === 'credit' ? 'Pengeluaran' : ({ invoice: 'Invoice', pembayaran: 'Pembayaran', pemasukan: 'Pemasukan', pengeluaran: 'Pengeluaran' }[row.type] || row.type);
watch([tab, start, end, account, search], () => { page.value = 1; });
const print = () => window.print();
</script>

<template>
  <div class="report-page p-6">
    <header class="report-header mb-5 flex items-start justify-between gap-4"><div><h1 class="text-xl font-semibold text-[#172033]">Laporan</h1><p class="mt-0.5 text-sm text-[#667085]">Laporan keuangan dan transaksi perusahaan.</p><p v-if="loadError" class="mt-2 text-sm text-red-600">Data laporan belum dapat dimuat. Muat ulang halaman sebelum mencetak.</p></div><div class="report-actions flex gap-2"><BaseButton variant="secondary" :disabled="!ready || !validRange" @click="print"><Printer :size="14" />Cetak</BaseButton><BaseButton variant="secondary" :disabled="!ready || !validRange" @click="print"><Download :size="14" />Simpan PDF</BaseButton></div></header>
    <div class="report-toolbar mb-5 flex overflow-x-auto border-b border-[#E2E6EC]"><button v-for="item in tabs" :key="item[0]" :class="['shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium', tab === item[0] ? '-mb-px border-[#173B6C] text-[#173B6C]' : 'border-transparent text-[#667085]']" @click="tab = item[0]">{{ item[1] }}</button></div>
    <section class="report-toolbar mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-[#E2E6EC] bg-white p-4"><BaseInput v-model="start" label="Tanggal Awal" type="date" /><BaseInput v-model="end" label="Tanggal Akhir" type="date" /><BaseSelect v-model="account" label="Rekening" class="w-36" :options="[{ value: 'semua', label: 'Semua' }, ...accounts.map((item) => ({ value: item.id, label: item.nama }))]" /><BaseInput v-model="search" label="Cari" class="min-w-48" placeholder="Cari keterangan..."><template #prefix><Search :size="14" /></template></BaseInput><p v-if="!validRange" class="text-sm text-red-600">Tanggal awal tidak boleh melewati tanggal akhir.</p></section>
    <template v-if="validRange && tab === 'debit-kredit'"><div class="mb-5 grid gap-4 sm:grid-cols-3"><BaseCard v-for="item in [{ label: 'Total Debit (Masuk)', value: debit, color: '#16A34A' }, { label: 'Total Kredit (Keluar)', value: credit, color: '#DC2626' }, { label: 'Saldo', value: balance, color: balance >= 0 ? '#172033' : '#DC2626' }]" :key="item.label" padding="p-4"><p class="mb-2 text-xs text-[#667085]">{{ item.label }}</p><p class="text-lg font-bold" :style="{ color: item.color }">{{ formatCurrency(item.value) }}</p></BaseCard></div><section class="report-content overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white"><div class="flex justify-between border-b border-[#E2E6EC] px-5 py-3"><h2 class="text-sm font-semibold">{{ reportTitle }}</h2><span class="text-xs text-[#667085]">{{ formatDate(start) }} — {{ formatDate(end) }}</span></div><table class="w-full min-w-[760px]"><thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th v-for="heading in ['Tanggal', 'Sumber', 'Keterangan', 'Debit (+)', 'Kredit (-)']" :key="heading" class="px-4 py-3 text-left text-xs font-medium text-[#667085] first:px-5 last:text-right">{{ heading }}</th></tr></thead><tbody><tr v-if="!rows.length"><td colspan="5" class="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada transaksi</td></tr><tr v-for="row in rows" :key="row.id" class="border-b border-[#F3F4F6]"><td class="px-5 py-3 text-sm text-[#667085]">{{ formatDate(row.date) }}</td><td class="px-4 py-3 text-sm text-[#667085]">{{ row.type === 'debit' ? (row.source === 'invoice' ? 'Pembayaran Invoice' : 'Pemasukan Manual') : 'Pengeluaran' }}</td><td class="px-4 py-3 text-sm">{{ row.description }}</td><td class="px-4 py-3 text-right text-sm font-medium text-green-600">{{ row.type === 'debit' ? formatCurrency(row.amount) : '-' }}</td><td class="px-4 py-3 text-right text-sm font-medium text-red-600">{{ row.type === 'credit' ? formatCurrency(row.amount) : '-' }}</td></tr></tbody><tfoot><tr class="border-t-2 border-[#E2E6EC] bg-[#F9FAFB]"><td colspan="3" class="px-5 py-3 font-semibold">Total</td><td class="px-4 py-3 text-right font-bold text-green-600">{{ formatCurrency(debit) }}</td><td class="px-4 py-3 text-right font-bold text-red-600">{{ formatCurrency(credit) }}</td></tr></tfoot></table><div class="report-toolbar"><Pagination :page="page" :total="cashbook.length" :per-page="pageSize" @change="page = $event" /></div></section></template>
    <section v-else-if="validRange" class="report-content overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white"><div class="border-b border-[#E2E6EC] px-5 py-3"><h2 class="text-sm font-semibold">{{ reportTitle }}</h2></div><table class="w-full min-w-[650px]"><thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th class="px-5 py-3 text-left text-xs font-medium text-[#667085]">Tanggal</th><th class="px-4 py-3 text-left text-xs font-medium text-[#667085]">Keterangan</th><th class="px-4 py-3 text-left text-xs font-medium text-[#667085]">Sumber</th><th class="px-4 py-3 text-right text-xs font-medium text-[#667085]">Nominal</th></tr></thead><tbody><tr v-if="!simpleRows.length"><td colspan="4" class="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada data</td></tr><tr v-for="row in simpleRows" :key="row.id" class="border-b border-[#F3F4F6]"><td class="px-5 py-3 text-sm text-[#667085]">{{ formatDate(row.date) }}</td><td class="px-4 py-3 text-sm">{{ row.description }}</td><td class="px-4 py-3 text-sm text-[#667085]">{{ row.type }}</td><td class="px-4 py-3 text-right text-sm font-semibold" :class="row.type === 'pengeluaran' ? 'text-red-600' : 'text-green-600'">{{ formatCurrency(row.amount) }}</td></tr></tbody></table><div class="report-toolbar"><Pagination :page="page" :total="entityRows.length" :per-page="pageSize" @change="page = $event" /></div></section>
    <article v-if="ready && validRange" class="report-print" aria-hidden="true">
      <header class="print-brand">
        <img v-if="company.logoUrl" :src="company.logoUrl" alt="" class="print-logo" @error="$event.target.style.display = 'none'" />
        <div class="print-company"><strong>{{ company.name }}</strong><span v-if="company.address">{{ company.address }}</span><span v-if="company.phone || company.email">{{ [company.phone, company.email].filter(Boolean).join(' | ') }}</span></div>
        <div class="print-label">LAPORAN<br /><span>KEUANGAN & TRANSAKSI</span></div>
      </header>
      <div class="print-title"><div><p>RINGKASAN LAPORAN</p><h1>{{ reportTitle }}</h1></div><div class="print-period"><span>PERIODE</span><strong>{{ periodLabel }}</strong></div></div>
      <div class="print-filters"><span><b>Rekening</b> {{ accountLabel }}</span><span v-if="search"><b>Pencarian</b> {{ search }}</span><span><b>Jumlah data</b> {{ reportRows.length }}</span></div>
      <div v-if="tab === 'debit-kredit'" class="print-summary">
        <div><span>TOTAL DEBIT (MASUK)</span><strong>{{ formatCurrency(debit) }}</strong></div>
        <div><span>TOTAL KREDIT (KELUAR)</span><strong>{{ formatCurrency(credit) }}</strong></div>
        <div><span>SALDO</span><strong>{{ formatCurrency(balance) }}</strong></div>
      </div>
      <table class="print-table">
        <thead><tr><th class="print-date">Tanggal</th><th v-if="tab === 'debit-kredit'" class="print-source">Sumber</th><th>Keterangan</th><th v-if="tab !== 'debit-kredit'" class="print-source">Sumber</th><th class="print-number">{{ tab === 'debit-kredit' ? 'Debit (+)' : 'Nominal' }}</th><th v-if="tab === 'debit-kredit'" class="print-number">Kredit (-)</th></tr></thead>
        <tbody>
          <tr v-if="!reportRows.length"><td :colspan="tab === 'debit-kredit' ? 5 : 4" class="print-empty">Tidak ada data untuk filter yang dipilih.</td></tr>
          <tr v-for="row in reportRows" :key="`${row.type}-${row.id}`"><td>{{ formatDate(row.date) }}</td><td v-if="tab === 'debit-kredit'">{{ sourceLabel(row) }}</td><td class="print-description">{{ row.description }}</td><td v-if="tab !== 'debit-kredit'">{{ sourceLabel(row) }}</td><td class="print-number">{{ tab !== 'debit-kredit' || row.type === 'debit' ? formatCurrency(row.amount) : '-' }}</td><td v-if="tab === 'debit-kredit'" class="print-number">{{ row.type === 'credit' ? formatCurrency(row.amount) : '-' }}</td></tr>
        </tbody>
        <tfoot><tr><td :colspan="tab === 'debit-kredit' ? 3 : 3">Total</td><td class="print-number">{{ formatCurrency(tab === 'debit-kredit' ? debit : reportTotal) }}</td><td v-if="tab === 'debit-kredit'" class="print-number">{{ formatCurrency(credit) }}</td></tr></tfoot>
      </table>
      <p class="print-note">Laporan ini menampilkan seluruh data sesuai periode dan filter yang dipilih.</p>
    </article>
  </div>
</template>

<style>
.report-print { display: none; }
@media print {
  @page { size: A4 portrait; margin: 15mm 14mm; }
  body * { visibility: hidden; }
  .report-print, .report-print * { visibility: visible; }
  .report-print { display: block; position: absolute; top: 0; left: 0; width: 100%; color: #172033; font-family: Arial, sans-serif; font-size: 9pt; line-height: 1.45; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .print-brand { display: flex; align-items: center; gap: 12px; padding-bottom: 15px; border-bottom: 2px solid #173b6c; }
  .print-logo { width: 48px; height: 48px; object-fit: contain; flex: none; }
  .print-company { flex: 1; min-width: 0; } .print-company strong, .print-company span { display: block; } .print-company strong { color: #173b6c; font-size: 13pt; } .print-company span { color: #65738a; font-size: 8pt; overflow-wrap: anywhere; }
  .print-label { text-align: right; color: #173b6c; font-weight: bold; font-size: 10pt; letter-spacing: .08em; white-space: nowrap; } .print-label span { color: #77859a; font-size: 6.5pt; letter-spacing: .04em; }
  .print-title { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin: 23px 0 15px; } .print-title p, .print-period span { margin: 0 0 3px; color: #748198; font-size: 7pt; font-weight: bold; letter-spacing: .08em; } .print-title h1 { margin: 0; color: #172b4d; font-size: 18pt; line-height: 1.2; } .print-period { text-align: right; } .print-period span, .print-period strong { display: block; } .print-period strong { white-space: nowrap; font-size: 9pt; }
  .print-filters { display: flex; flex-wrap: wrap; gap: 8px 22px; padding: 10px 0; border-top: 1px solid #dce3ec; border-bottom: 1px solid #dce3ec; color: #53637a; font-size: 8pt; } .print-filters b { color: #263b59; margin-right: 5px; }
  .print-summary { display: flex; gap: 10px; margin: 16px 0; } .print-summary div { flex: 1; padding: 10px 12px; border: 1px solid #dce3ec; border-radius: 5px; } .print-summary span, .print-summary strong { display: block; } .print-summary span { color: #68778c; font-size: 7pt; } .print-summary strong { margin-top: 5px; color: #173b6c; font-size: 11pt; }
  .print-table { width: 100%; margin-top: 18px; border-collapse: collapse; table-layout: fixed; font-size: 8pt; } .print-table thead { display: table-header-group; } .print-table tr { break-inside: avoid; } .print-table th { padding: 9px 7px; border-bottom: 1px solid #9cacbf; background: #eef3f8; color: #263b59; text-align: left; } .print-table td { padding: 9px 7px; border-bottom: 1px solid #e1e7ee; vertical-align: top; overflow-wrap: anywhere; } .print-table .print-date { width: 18%; } .print-table .print-source { width: 19%; } .print-table .print-number { width: 18%; text-align: right; white-space: nowrap; } .print-table .print-empty { padding: 28px 7px; text-align: center; color: #718096; } .print-table tfoot { display: table-row-group; } .print-table tfoot td { border-top: 1px solid #9cacbf; border-bottom: 0; font-weight: bold; color: #173b6c; }
  .print-note { margin-top: 14px; color: #748198; font-size: 7.5pt; }
}
</style>
