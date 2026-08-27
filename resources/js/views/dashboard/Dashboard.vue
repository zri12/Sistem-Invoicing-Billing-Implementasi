<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AlertCircle, ArrowRight, CheckCircle, Clock, FileText, MinusCircle, TrendingDown, TrendingUp } from 'lucide-vue-next';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import { dashboardChart, dashboardExpenses, dashboardIncomes, dashboardInvoices } from '@/data/dashboardMock';
import { formatCurrency, formatDate } from '@/utils/formatters';

const router = useRouter();
const period = ref('Bulan Ini');
const activeChart = ref(null);
const chartMax = 10000000;
const chartTicks = [10000000, 7500000, 5000000, 2500000, 0];
const metrics = computed(() => ({
    totalInvoice: dashboardInvoices.filter((invoice) => invoice.documentStatus !== 'dibatalkan').length,
    outstanding: dashboardInvoices.filter((invoice) => invoice.documentStatus === 'diterbitkan').reduce((total, invoice) => total + Math.max(0, invoice.total - invoice.paid), 0),
    income: dashboardIncomes.reduce((total, value) => total + value, 0),
    expense: dashboardExpenses.reduce((total, value) => total + value, 0),
}));
const summaryCards = computed(() => [
    { label: 'Total Invoice', value: String(metrics.value.totalInvoice), sub: 'invoice aktif', icon: FileText, accent: '#173B6C', route: 'invoice' },
    { label: 'Sisa Tagihan', value: formatCurrency(metrics.value.outstanding), sub: 'belum terlunasi', icon: AlertCircle, accent: '#D97706', route: 'billing' },
    { label: 'Total Pemasukan', value: formatCurrency(metrics.value.income), sub: 'bulan ini', icon: TrendingUp, accent: '#16A34A', route: 'pemasukan' },
    { label: 'Total Pengeluaran', value: formatCurrency(metrics.value.expense), sub: 'bulan ini', icon: TrendingDown, accent: '#DC2626', route: 'pengeluaran' },
]);
const statusRows = computed(() => [
    { key: 'belum_dibayar', label: 'Belum Dibayar', color: '#94A3B8', icon: MinusCircle },
    { key: 'dibayar_sebagian', label: 'Dibayar Sebagian', color: '#D97706', icon: Clock },
    { key: 'lunas', label: 'Lunas', color: '#16A34A', icon: CheckCircle },
    { key: 'jatuh_tempo', label: 'Jatuh Tempo', color: '#DC2626', icon: AlertCircle },
].map((item) => ({ ...item, count: dashboardInvoices.filter((invoice) => invoice.documentStatus !== 'dibatalkan' && invoice.paymentStatus === item.key).length })));
const recentInvoices = computed(() => [...dashboardInvoices].sort((left, right) => right.issuedAt.localeCompare(left.issuedAt)).slice(0, 5));
const paymentBadge = (status) => ({ belum_dibayar: ['Belum Dibayar', 'neutral'], dibayar_sebagian: ['Dibayar Sebagian', 'warning'], lunas: ['Lunas', 'success'], jatuh_tempo: ['Jatuh Tempo', 'danger'] }[status]);
const chartHeight = (value) => Math.round((value / chartMax) * 134);
const chartY = (value) => 142 - chartHeight(value);
const goTo = (name) => router.push({ name });
const viewInvoice = (id) => router.push({ name: 'invoice', query: { invoice: id } });
</script>

<template>
    <div class="space-y-4 p-6">
        <header class="flex items-center justify-between pb-1">
            <div><h1 class="text-[18px] font-semibold leading-snug text-[#172033]">Dashboard</h1><p class="mt-0.5 text-[13px] text-[#9CA3AF]">Ringkasan keuangan dan aktivitas terkini</p></div>
            <div class="relative"><select v-model="period" aria-label="Pilih periode dashboard" class="h-8 appearance-none rounded-md border border-[#E2E6EC] bg-white py-0 pl-3 pr-8 text-[13px] text-[#667085] outline-none focus:border-[#173B6C]"><option>Bulan Ini</option><option>3 Bulan Terakhir</option><option>Tahun Ini</option></select><svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg></div>
        </header>

        <div class="grid grid-cols-4 gap-3.5">
            <button v-for="card in summaryCards" :key="card.label" class="group rounded-lg border border-[#E2E6EC] bg-white px-4 py-4 text-left transition-colors hover:border-[#D0D8E4]" @click="goTo(card.route)"><div class="mb-3 flex items-center justify-between"><span class="text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]">{{ card.label }}</span><component :is="card.icon" :size="15" :style="{ color: `${card.accent}CC` }" /></div><p class="tabular-nums text-[20px] font-bold leading-tight text-[#172033]">{{ card.value }}</p><p class="mt-1 text-[11px] text-[#B0BAC7]">{{ card.sub }}</p></button>
        </div>

        <div class="grid grid-cols-3 gap-3.5">
            <BaseCard><div class="mb-3.5 flex items-center justify-between"><h2 class="text-[13px] font-semibold text-[#172033]">Status Invoice</h2><button class="flex items-center gap-0.5 text-[11px] text-[#315DA8] hover:underline" @click="goTo('invoice')">Lihat Semua <ArrowRight :size="10" /></button></div><div class="space-y-2.5"><div v-for="status in statusRows" :key="status.key" class="flex items-center justify-between gap-3"><div class="flex min-w-0 items-center gap-1.5"><component :is="status.icon" :size="13" class="shrink-0" :style="{ color: status.color }" /><span class="truncate text-[13px] text-[#4B5563]">{{ status.label }}</span></div><div class="flex shrink-0 items-center gap-2.5"><span class="h-1 w-20 overflow-hidden rounded-full bg-[#F3F4F6]"><span class="block h-full rounded-full opacity-80" :style="{ width: `${Math.min((status.count / 5) * 100, 100)}%`, background: status.color }" /></span><span class="w-4 text-right text-[13px] font-semibold text-[#172033]">{{ status.count }}</span></div></div></div><div class="mt-3.5 flex items-center justify-between border-t border-[#F3F4F6] pt-3"><span class="text-[11px] text-[#9CA3AF]">Saldo bersih periode ini</span><span class="text-[13px] font-semibold text-[#172033]">{{ formatCurrency(metrics.income - metrics.expense) }}</span></div></BaseCard>

            <BaseCard class="col-span-2"><div class="mb-3.5 flex items-center justify-between"><h2 class="text-[13px] font-semibold text-[#172033]">Pemasukan vs Pengeluaran</h2><div class="flex items-center gap-4 text-[11px] text-[#9CA3AF]"><span class="flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-sm bg-[#173B6C]" />Pemasukan</span><span class="flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-sm bg-[#EF4444]" />Pengeluaran</span></div></div><div class="relative h-44 w-full"><svg class="h-full w-full" viewBox="0 0 640 176" preserveAspectRatio="none" role="img" aria-label="Grafik pemasukan dan pengeluaran dari Maret hingga Agustus"><g v-for="tick in chartTicks" :key="tick"><line x1="60" x2="638" :y1="chartY(tick)" :y2="chartY(tick)" stroke="#F3F4F6" /><text x="0" :y="chartY(tick) + 3" fill="#B0BAC7" font-size="10">{{ tick === 0 ? 'Rp 0' : `Rp ${(tick / 1000000).toFixed(1)}jt` }}</text></g><g v-for="(month, index) in dashboardChart" :key="month.label" @mouseenter="activeChart = { ...month, index }" @mouseleave="activeChart = null"><rect :x="70 + index * 91" y="0" width="50" height="154" fill="transparent" /><rect :x="82 + index * 91" :y="chartY(month.income)" width="14" :height="chartHeight(month.income)" rx="3" ry="3" fill="#173B6C" /><rect :x="99 + index * 91" :y="chartY(month.expense)" width="14" :height="chartHeight(month.expense)" rx="3" ry="3" fill="#EF4444" /><text :x="98 + index * 91" y="171" text-anchor="middle" fill="#B0BAC7" font-size="11">{{ month.label }}</text></g></svg><div v-if="activeChart" class="pointer-events-none absolute z-10 rounded-[6px] border border-[#E2E6EC] bg-white px-2.5 py-1.5 text-xs shadow-sm" :style="{ left: `${Math.min(78, 11 + activeChart.index * 15)}%`, top: '8px' }"><p class="font-medium text-[#172033]">{{ activeChart.label }}</p><p class="text-[#173B6C]">Pemasukan: {{ formatCurrency(activeChart.income) }}</p><p class="text-[#EF4444]">Pengeluaran: {{ formatCurrency(activeChart.expense) }}</p></div></div></BaseCard>
        </div>

        <section class="overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white"><div class="flex items-center justify-between border-b border-[#E2E6EC] px-5 py-3.5"><h2 class="text-[13px] font-semibold text-[#172033]">Invoice Terbaru</h2><button class="flex items-center gap-0.5 text-[11px] text-[#315DA8] hover:underline" @click="goTo('invoice')">Lihat Semua <ArrowRight :size="10" /></button></div><table class="w-full min-w-[640px]"><thead><tr class="border-b border-[#F3F4F6]"><th class="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">Nomor Invoice</th><th class="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">Klien</th><th class="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">Jatuh Tempo</th><th class="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">Total</th><th class="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">Status</th></tr></thead><tbody><tr v-for="invoice in recentInvoices" :key="invoice.id" class="cursor-pointer border-b border-[#F9FAFB] transition-colors hover:bg-[#FAFBFC]" @click="viewInvoice(invoice.id)"><td class="px-5 py-3 text-[13px] font-semibold text-[#173B6C]">{{ invoice.number }}</td><td class="px-4 py-3 text-[13px] text-[#172033]">{{ invoice.client }}</td><td class="px-4 py-3 text-[13px] text-[#9CA3AF]">{{ formatDate(invoice.dueAt) }}</td><td class="px-4 py-3 text-right text-[13px] font-medium tabular-nums text-[#172033]">{{ formatCurrency(invoice.total) }}</td><td class="px-4 py-3"><BaseBadge :variant="paymentBadge(invoice.paymentStatus)[1]">{{ paymentBadge(invoice.paymentStatus)[0] }}</BaseBadge></td></tr></tbody></table></section>
    </div>
</template>
