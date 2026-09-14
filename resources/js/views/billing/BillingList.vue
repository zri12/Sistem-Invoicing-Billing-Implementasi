<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Receipt, Search } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useInvoiceStore } from '@/stores/invoice';
import { usePaymentStore } from '@/stores/payment';
import { formatCurrency, formatDate } from '@/utils/formatters';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import Pagination from '@/components/ui/Pagination.vue';

const router = useRouter();
const invoices = useInvoiceStore();
const payments = usePaymentStore();
const search = ref('');
const filter = ref('semua');
const page = ref(1);
const pageSize = 5;
const ready = ref(invoices.loaded && payments.loaded);

// Menyambung request yang telah dimulai router, bukan memulai request kedua.
onMounted(async () => {
    try {
        await Promise.all([invoices.ensure(), payments.ensure()]);
    } finally {
        ready.value = true;
    }
});

const badge = (status) => ({ belum_dibayar: ['Belum Dibayar', 'neutral'], dibayar_sebagian: ['Dibayar Sebagian', 'warning'], lunas: ['Lunas', 'success'], jatuh_tempo: ['Jatuh Tempo', 'danger'] }[status]);
const billings = computed(() => invoices.invoices.filter((invoice) => invoice.status === 'published').map((invoice) => ({ invoice, ...payments.paymentSummaryByInvoice(invoice) })));
const filtered = computed(() => billings.value.filter((item) => (filter.value === 'semua' || item.status === filter.value) && `${item.invoice.number} ${item.invoice.client} ${item.invoice.name}`.toLowerCase().includes(search.value.toLowerCase())));
const rows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const summary = computed(() => ({ total: filtered.value.reduce((sum, item) => sum + item.total, 0), paid: filtered.value.reduce((sum, item) => sum + item.totalPaid, 0), remaining: filtered.value.reduce((sum, item) => sum + item.remaining, 0), overdue: filtered.value.filter((item) => item.status === 'jatuh_tempo').reduce((sum, item) => sum + item.remaining, 0) }));
watch([search, filter], () => { page.value = 1; });
</script>

<template>
  <div class="p-6">
    <header class="mb-5"><h1 class="text-xl font-semibold text-[#172033]">Billing</h1><p class="mt-0.5 text-sm text-[#667085]">Ringkasan tagihan, pembayaran diterima, dan sisa piutang.</p></header>
    <template v-if="ready">
      <div class="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><BaseCard v-for="card in [{ label: 'Total Tagihan', value: summary.total, color: '#173B6C' }, { label: 'Sudah Dibayar', value: summary.paid, color: '#16A34A' }, { label: 'Sisa Tagihan', value: summary.remaining, color: '#D97706' }, { label: 'Jatuh Tempo', value: summary.overdue, color: '#DC2626' }]" :key="card.label" padding="p-4"><p class="mb-2 text-xs uppercase tracking-wide text-[#667085]">{{ card.label }}</p><p class="text-lg font-bold" :style="{ color: card.color }">{{ formatCurrency(card.value) }}</p></BaseCard></div>
      <div class="mb-4 flex flex-wrap items-center gap-3"><BaseInput v-model="search" class="max-w-xs flex-1" placeholder="Cari invoice, klien..."><template #prefix><Search :size="14" /></template></BaseInput><BaseSelect v-model="filter" class="w-44" :options="[{ value: 'semua', label: 'Semua Status' }, { value: 'belum_dibayar', label: 'Belum Dibayar' }, { value: 'dibayar_sebagian', label: 'Dibayar Sebagian' }, { value: 'lunas', label: 'Lunas' }, { value: 'jatuh_tempo', label: 'Jatuh Tempo' }]" /></div>
      <section class="overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white"><table class="w-full min-w-[1000px]"><thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th v-for="heading in ['Invoice', 'Klien', 'Total Tagihan', 'Sudah Dibayar', 'Sisa Tagihan', 'Jatuh Tempo', 'Status', 'Aksi']" :key="heading" class="px-4 py-3 text-left text-xs font-medium text-[#667085] first:px-5">{{ heading }}</th></tr></thead><tbody><tr v-if="!rows.length"><td colspan="8" class="px-5 py-12 text-center text-sm text-[#9CA3AF]"><Receipt :size="32" class="mx-auto mb-2 opacity-40" />Belum ada data billing</td></tr><tr v-for="row in rows" :key="row.invoice.id" class="cursor-pointer border-b border-[#F3F4F6] hover:bg-gray-50" @click="router.push({ name: 'billing-detail', params: { invoiceId: row.invoice.id } })"><td class="px-5 py-3.5"><p class="text-sm font-semibold text-[#173B6C]">{{ row.invoice.number }}</p><p class="text-xs text-[#667085]">{{ row.invoice.name }}</p></td><td class="px-4 py-3.5 text-sm text-[#667085]">{{ row.invoice.client }}</td><td class="px-4 py-3.5 text-right text-sm font-medium">{{ formatCurrency(row.total) }}</td><td class="px-4 py-3.5 text-right text-sm font-medium text-green-600">{{ formatCurrency(row.totalPaid) }}</td><td class="px-4 py-3.5 text-right text-sm font-semibold" :class="row.remaining ? 'text-[#D97706]' : 'text-green-600'">{{ formatCurrency(row.remaining) }}</td><td class="px-4 py-3.5 text-sm text-[#667085]">{{ formatDate(row.invoice.dueDate) }}</td><td class="px-4 py-3.5"><BaseBadge :variant="badge(row.status)[1]">{{ badge(row.status)[0] }}</BaseBadge></td><td class="px-4 py-3.5"><button class="text-xs text-[#315DA8] hover:underline" @click.stop="router.push({ name: 'billing-detail', params: { invoiceId: row.invoice.id } })">Detail</button></td></tr></tbody></table><Pagination :page="page" :total="filtered.length" :per-page="pageSize" @change="page = $event" /></section>
    </template>
  </div>
</template>
