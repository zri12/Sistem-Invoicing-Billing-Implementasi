<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Download, Printer, Search } from 'lucide-vue-next';
import { useInvoiceStore } from '@/stores/invoice';
import { usePaymentStore } from '@/stores/payment';
import { useFinanceStore } from '@/stores/finance';
import { useMasterDataStore } from '@/stores/masterData';
import { formatCurrency, formatDate, todayIso } from '@/utils/formatters';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import Pagination from '@/components/ui/Pagination.vue';

const invoices = useInvoiceStore(); const payments = usePaymentStore(); const finance = useFinanceStore(); const masterData = useMasterDataStore();
const tab = ref('debit-kredit'); const start = ref(`${todayIso().slice(0, 7)}-01`); const end = ref(todayIso()); const account = ref('semua'); const search = ref(''); const page = ref(1); const pageSize = 8;
onMounted(() => { invoices.ensure(); payments.ensure(); finance.ensure(); masterData.ensureAll(); });
const accounts = computed(() => masterData.accounts);
const tabs = [['debit-kredit', 'Keuangan / Debit & Kredit'], ['invoice', 'Invoice'], ['pembayaran', 'Pembayaran'], ['pemasukan', 'Pemasukan'], ['pengeluaran', 'Pengeluaran']];
const validRange = computed(() => !start.value || !end.value || start.value <= end.value);
const matches = (entry) => entry.date >= start.value && entry.date <= end.value && (account.value === 'semua' || entry.accountId === account.value) && entry.description.toLowerCase().includes(search.value.toLowerCase());
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
watch([tab, start, end, account, search], () => { page.value = 1; });
const print = () => window.print();
</script>

<template>
  <div class="report-page p-6">
    <header class="report-header mb-5 flex items-start justify-between gap-4"><div><h1 class="text-xl font-semibold text-[#172033]">Laporan</h1><p class="mt-0.5 text-sm text-[#667085]">Laporan keuangan dan transaksi perusahaan.</p></div><div class="report-actions flex gap-2"><BaseButton variant="secondary" @click="print"><Printer :size="14" />Cetak</BaseButton><BaseButton variant="secondary" @click="print"><Download :size="14" />Simpan PDF</BaseButton></div></header>
    <div class="report-toolbar mb-5 flex overflow-x-auto border-b border-[#E2E6EC]"><button v-for="item in tabs" :key="item[0]" :class="['shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium', tab === item[0] ? '-mb-px border-[#173B6C] text-[#173B6C]' : 'border-transparent text-[#667085]']" @click="tab = item[0]">{{ item[1] }}</button></div>
    <section class="report-toolbar mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-[#E2E6EC] bg-white p-4"><BaseInput v-model="start" label="Tanggal Awal" type="date" /><BaseInput v-model="end" label="Tanggal Akhir" type="date" /><BaseSelect v-model="account" label="Rekening" class="w-36" :options="[{ value: 'semua', label: 'Semua' }, ...accounts.map((item) => ({ value: item.id, label: item.nama }))]" /><BaseInput v-model="search" label="Cari" class="min-w-48" placeholder="Cari keterangan..."><template #prefix><Search :size="14" /></template></BaseInput><p v-if="!validRange" class="text-sm text-red-600">Tanggal awal tidak boleh melewati tanggal akhir.</p></section>
    <template v-if="validRange && tab === 'debit-kredit'"><div class="mb-5 grid gap-4 sm:grid-cols-3"><BaseCard v-for="item in [{ label: 'Total Debit (Masuk)', value: debit, color: '#16A34A' }, { label: 'Total Kredit (Keluar)', value: credit, color: '#DC2626' }, { label: 'Saldo', value: balance, color: balance >= 0 ? '#172033' : '#DC2626' }]" :key="item.label" padding="p-4"><p class="mb-2 text-xs text-[#667085]">{{ item.label }}</p><p class="text-lg font-bold" :style="{ color: item.color }">{{ formatCurrency(item.value) }}</p></BaseCard></div><section class="report-content overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white"><div class="flex justify-between border-b border-[#E2E6EC] px-5 py-3"><h2 class="text-sm font-semibold">{{ reportTitle }}</h2><span class="text-xs text-[#667085]">{{ formatDate(start) }} — {{ formatDate(end) }}</span></div><table class="w-full min-w-[760px]"><thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th v-for="heading in ['Tanggal', 'Sumber', 'Keterangan', 'Debit (+)', 'Kredit (-)']" :key="heading" class="px-4 py-3 text-left text-xs font-medium text-[#667085] first:px-5 last:text-right">{{ heading }}</th></tr></thead><tbody><tr v-if="!rows.length"><td colspan="5" class="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada transaksi</td></tr><tr v-for="row in rows" :key="row.id" class="border-b border-[#F3F4F6]"><td class="px-5 py-3 text-sm text-[#667085]">{{ formatDate(row.date) }}</td><td class="px-4 py-3 text-sm text-[#667085]">{{ row.type === 'debit' ? (row.source === 'invoice' ? 'Pembayaran Invoice' : 'Pemasukan Manual') : 'Pengeluaran' }}</td><td class="px-4 py-3 text-sm">{{ row.description }}</td><td class="px-4 py-3 text-right text-sm font-medium text-green-600">{{ row.type === 'debit' ? formatCurrency(row.amount) : '-' }}</td><td class="px-4 py-3 text-right text-sm font-medium text-red-600">{{ row.type === 'credit' ? formatCurrency(row.amount) : '-' }}</td></tr></tbody><tfoot><tr class="border-t-2 border-[#E2E6EC] bg-[#F9FAFB]"><td colspan="3" class="px-5 py-3 font-semibold">Total</td><td class="px-4 py-3 text-right font-bold text-green-600">{{ formatCurrency(debit) }}</td><td class="px-4 py-3 text-right font-bold text-red-600">{{ formatCurrency(credit) }}</td></tr></tfoot></table><div class="report-toolbar"><Pagination :page="page" :total="cashbook.length" :per-page="pageSize" @change="page = $event" /></div></section></template>
    <section v-else-if="validRange" class="report-content overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white"><div class="border-b border-[#E2E6EC] px-5 py-3"><h2 class="text-sm font-semibold">{{ reportTitle }}</h2></div><table class="w-full min-w-[650px]"><thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th class="px-5 py-3 text-left text-xs font-medium text-[#667085]">Tanggal</th><th class="px-4 py-3 text-left text-xs font-medium text-[#667085]">Keterangan</th><th class="px-4 py-3 text-left text-xs font-medium text-[#667085]">Sumber</th><th class="px-4 py-3 text-right text-xs font-medium text-[#667085]">Nominal</th></tr></thead><tbody><tr v-if="!simpleRows.length"><td colspan="4" class="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada data</td></tr><tr v-for="row in simpleRows" :key="row.id" class="border-b border-[#F3F4F6]"><td class="px-5 py-3 text-sm text-[#667085]">{{ formatDate(row.date) }}</td><td class="px-4 py-3 text-sm">{{ row.description }}</td><td class="px-4 py-3 text-sm text-[#667085]">{{ row.type }}</td><td class="px-4 py-3 text-right text-sm font-semibold" :class="row.type === 'pengeluaran' ? 'text-red-600' : 'text-green-600'">{{ formatCurrency(row.amount) }}</td></tr></tbody></table><div class="report-toolbar"><Pagination :page="page" :total="entityRows.length" :per-page="pageSize" @change="page = $event" /></div></section>
  </div>
</template>

<style>
@media print { body * { visibility: hidden; } .report-page, .report-page * { visibility: visible; } .report-page { position: absolute; inset: 0; padding: 0 !important; } .report-toolbar, .report-actions { display: none !important; } .report-content { border: 0 !important; overflow: visible !important; } }
</style>
