<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Search, Wallet } from 'lucide-vue-next';
import { usePaymentStore } from '@/stores/payment';
import { formatCurrency, formatDate, currentMonthKey } from '@/utils/formatters';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import Pagination from '@/components/ui/Pagination.vue';

const payments = usePaymentStore();
const search = ref('');
const period = ref('semua');
const method = ref('semua');
const account = ref('semua');
const page = ref(1);
const pageSize = 5;
const detail = ref(null);
const ready = ref(false);

// Semua informasi yang dibutuhkan halaman ini berasal dari endpoint pembayaran.
// Tidak lagi menunggu request invoice dan rekening secara terpisah.
onMounted(async () => {
    try {
        await payments.ensure();
    } finally {
        ready.value = true;
    }
});

const accounts = computed(() => Array.from(new Map(
    payments.payments
        .filter((payment) => payment.accountId && payment.accountName)
        .map((payment) => [payment.accountId, { id: payment.accountId, nama: payment.accountName }]),
).values()));

const filtered = computed(() => payments.payments.filter((payment) => {
    const text = `${payment.invoiceNumber} ${payment.clientName}`.toLowerCase();
    const periodMatch = period.value === 'semua'
        || (period.value === 'bulan_ini' && payment.paymentDate.slice(0, 7) === currentMonthKey());

    return text.includes(search.value.toLowerCase())
        && (method.value === 'semua' || payment.method === method.value)
        && (account.value === 'semua' || payment.accountId === account.value)
        && periodMatch;
}));
const rows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const total = computed(() => filtered.value.reduce((sum, payment) => sum + payment.amount, 0));
watch([search, period, method, account], () => { page.value = 1; });
</script>

<template>
    <div class="p-6">
        <header class="mb-5">
            <h1 class="text-xl font-semibold text-[#172033]">Pembayaran</h1>
            <p class="mt-0.5 text-sm text-[#667085]">Riwayat semua pembayaran yang telah diterima.</p>
        </header>

        <template v-if="ready">
            <div class="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <BaseCard padding="p-4"><p class="mb-2 text-xs text-[#667085]">Total Pembayaran Diterima</p><p class="text-xl font-bold text-[#16A34A]">{{ formatCurrency(total) }}</p></BaseCard>
                <BaseCard padding="p-4"><p class="mb-2 text-xs text-[#667085]">Jumlah Transaksi</p><p class="text-xl font-bold text-[#172033]">{{ filtered.length }}</p></BaseCard>
            </div>

            <div class="mb-4 flex flex-wrap items-center gap-3">
                <BaseInput v-model="search" class="max-w-xs flex-1" placeholder="Cari invoice, klien..."><template #prefix><Search :size="14" /></template></BaseInput>
                <BaseSelect v-model="period" class="w-40" :options="[{ value: 'semua', label: 'Semua Periode' }, { value: 'bulan_ini', label: 'Bulan Ini' }, { value: 'bulan_lalu', label: 'Bulan Lalu' }]" />
                <BaseSelect v-model="method" class="w-40" :options="[{ value: 'semua', label: 'Semua Metode' }, 'Transfer Bank', 'Kas', 'Cek', 'QRIS']" />
                <BaseSelect v-model="account" class="w-36" :options="[{ value: 'semua', label: 'Semua Rekening' }, ...accounts.map((item) => ({ value: item.id, label: item.nama }))]" />
            </div>

            <section class="overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white">
                <table class="w-full min-w-[1050px]">
                    <thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th v-for="heading in ['Tanggal', 'Invoice', 'Klien', 'Metode', 'Referensi', 'Rekening', 'Nominal', 'Aksi']" :key="heading" class="px-4 py-3 text-left text-xs font-medium text-[#667085] first:px-5 last:text-center">{{ heading }}</th></tr></thead>
                    <tbody>
                        <tr v-if="!rows.length"><td colspan="8" class="px-5 py-12 text-center text-sm text-[#9CA3AF]"><Wallet :size="32" class="mx-auto mb-2 opacity-40" />Belum ada data pembayaran</td></tr>
                        <tr v-for="payment in rows" :key="payment.id" class="border-b border-[#F3F4F6] hover:bg-gray-50">
                            <td class="px-5 py-3.5 text-sm text-[#667085]">{{ formatDate(payment.paymentDate) }}</td>
                            <td class="px-4 py-3.5 text-sm font-medium text-[#173B6C]">{{ payment.invoiceNumber || '-' }}</td>
                            <td class="px-4 py-3.5 text-sm text-[#667085]">{{ payment.clientName || '-' }}</td>
                            <td class="px-4 py-3.5 text-sm text-[#667085]">{{ payment.method }}</td>
                            <td class="px-4 py-3.5 font-mono text-xs text-[#667085]">{{ payment.referenceNumber || '-' }}</td>
                            <td class="px-4 py-3.5 text-sm text-[#667085]">{{ payment.accountName || '-' }}</td>
                            <td class="px-4 py-3.5 text-right text-sm font-semibold text-[#172033]">{{ formatCurrency(payment.amount) }}</td>
                            <td class="px-4 py-3.5 text-center"><button class="text-xs text-[#315DA8] hover:underline" @click="detail = payment">Detail</button></td>
                        </tr>
                    </tbody>
                </table>
                <Pagination :page="page" :total="filtered.length" :per-page="pageSize" @change="page = $event" />
            </section>
        </template>

        <BaseModal :open="Boolean(detail)" title="Detail Pembayaran" size="sm" @close="detail = null">
            <dl v-if="detail" class="space-y-3 text-sm">
                <div v-for="field in [['Tanggal', formatDate(detail.paymentDate)], ['Nomor Invoice', detail.invoiceNumber || '-'], ['Klien', detail.clientName || '-'], ['Metode', detail.method], ['Rekening', detail.accountName || '-'], ['Referensi', detail.referenceNumber || '-'], ['Nominal', formatCurrency(detail.amount)]]" :key="field[0]" class="flex justify-between gap-4"><dt class="text-[#667085]">{{ field[0] }}</dt><dd class="text-right font-medium text-[#172033]">{{ field[1] }}</dd></div>
            </dl>
        </BaseModal>
    </div>
</template>
