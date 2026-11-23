<script setup>
import { Bell, Menu } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUiStore } from '@/stores/ui';
import api from '@/services/api';
import { formatCurrency } from '@/utils/formatters';

const ui = useUiStore();
const route = useRoute();
const router = useRouter();
const open = ref(false);
const loading = ref(false);
const error = ref(false);
const activities = ref([]);
const title = computed(() => route.meta.title || '');
const labels = { payment: 'Pembayaran invoice', income: 'Pemasukan manual', expense: 'Pengeluaran' };
const destinations = { payment: 'pembayaran', income: 'pemasukan', expense: 'pengeluaran' };
const toggle = async () => {
    open.value = !open.value;
    if (!open.value) return;
    loading.value = true;
    error.value = false;
    try { activities.value = (await api.get('/recent-activity')).data.data; }
    catch { error.value = true; }
    finally { loading.value = false; }
};
const showActivity = (item) => { open.value = false; router.push({ name: destinations[item.type] }); };
</script>
<template>
  <header class="flex h-[52px] shrink-0 items-center justify-between border-b border-[#E2E6EC] bg-white px-4 sm:px-6">
    <div class="flex min-w-0 items-center gap-2"><button class="flex h-8 w-8 items-center justify-center rounded-md text-[#667085] lg:hidden" aria-label="Buka navigasi" @click="ui.openMobileSidebar"><Menu :size="18" /></button><span class="truncate text-xs font-medium tracking-wide text-[#A0AABB]">{{ title }}</span></div>
    <div class="relative"><button class="flex h-8 w-8 items-center justify-center rounded-md text-[#667085] hover:bg-[#F5F7FA]" aria-label="Buka notifikasi" :aria-expanded="open" @click="toggle"><Bell :size="15" /></button>
      <div v-if="open" class="absolute right-0 top-10 z-30 w-80 max-w-[90vw] rounded-lg border border-[#E2E6EC] bg-white p-3 shadow-lg">
        <p class="text-sm font-semibold text-[#172033]">Aktivitas Transaksi Terbaru</p>
        <p class="mt-1 text-xs text-[#667085]">Menampilkan hingga 10 transaksi terakhir.</p>
        <p v-if="loading" class="mt-3 text-xs text-[#667085]">Memuat aktivitas...</p>
        <p v-else-if="error" class="mt-3 text-xs text-red-600">Aktivitas gagal dimuat. Tutup dan buka kembali untuk mencoba lagi.</p>
        <p v-else-if="!activities.length" class="mt-3 text-xs text-[#667085]">Belum ada transaksi.</p>
        <div v-else class="mt-2 max-h-80 overflow-y-auto"><button v-for="item in activities" :key="item.id" class="block w-full border-t border-[#E2E6EC] py-2 text-left text-xs hover:bg-[#F5F7FA]" @click="showActivity(item)"><span class="font-semibold text-[#173B6C]">{{ labels[item.type] }} - {{ formatCurrency(item.amount) }}</span><span class="mt-1 block break-words text-[#667085]">{{ item.description }}</span><time v-if="item.created_at" class="mt-1 block text-[#98A2B3]">{{ new Date(item.created_at).toLocaleString('id-ID') }}</time></button></div>
      </div>
    </div>
  </header>
</template>
