<script setup>
import { computed, reactive } from 'vue';
import { Save } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useInvoiceStore } from '@/stores/invoice';
import { useSettingsStore } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';
import { todayIso } from '@/utils/formatters';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';

const settings = useSettingsStore();
const invoices = useInvoiceStore();
const ui = useUiStore();
const auth = useAuthStore();
const form = reactive({ ...settings.invoiceNumbering });
const readOnly = computed(() => auth.role === 'manager');
const parseSequence = (number) => Number(/^\d+/.exec(number || '')?.[0]) || 0;
const next = computed(() => {
    const sequence = Math.max(0, ...invoices.invoices.map((invoice) => parseSequence(invoice.number))) + 1;
    return settings.formatNumber(sequence, todayIso());
});
const save = () => { settings.saveNumbering(form); ui.notify('Pengaturan penomoran berhasil disimpan.'); };
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex justify-between gap-4">
      <div><h1 class="text-xl font-semibold">Penomoran Invoice</h1><p class="mt-0.5 text-sm text-[#667085]">Konfigurasi format nomor invoice yang dibuat otomatis.</p></div>
      <BaseButton v-if="!readOnly" @click="save"><Save :size="14" />Simpan</BaseButton>
    </header>
    <BaseCard class="mb-6 border-[#C3D1E8] bg-[#EEF2F8]" padding="p-5"><p class="mb-2 text-xs font-medium text-[#315DA8]">Preview Format Saat Ini</p><p class="font-mono text-2xl font-bold tracking-wider text-[#173B6C]">{{ next }}</p></BaseCard>
    <BaseCard padding="p-5"><h2 class="mb-5 text-sm font-semibold">Konfigurasi Format</h2><div class="grid gap-4 sm:grid-cols-2"><BaseInput v-model="form.documentCode" label="Kode Dokumen" :disabled="readOnly" /><BaseInput v-model="form.companyCode" label="Kode Perusahaan" :disabled="readOnly" /><BaseInput v-model="form.digits" label="Digit Nomor" type="number" :disabled="readOnly" /><BaseSelect v-model="form.monthFormat" label="Format Bulan" :disabled="readOnly" :options="[{ value: 'romawi', label: 'Angka Romawi (VIII)' }, { value: 'angka', label: 'Angka (08)' }]" /><BaseSelect v-model="form.yearFormat" label="Format Tahun" :disabled="readOnly" :options="[{ value: '2digit', label: '2 Digit (26)' }, { value: '4digit', label: '4 Digit (2026)' }]" /><BaseSelect v-model="form.resetPolicy" label="Reset Urutan" :disabled="readOnly" :options="[{ value: 'belum', label: 'Belum Ditentukan' }, { value: 'bulanan', label: 'Setiap Bulan' }, { value: 'tahunan', label: 'Setiap Tahun' }, { value: 'tidak', label: 'Tidak Direset' }]" /></div></BaseCard>
    <p class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">Perubahan hanya berlaku untuk invoice baru. Kebijakan reset akhir masih memerlukan konfirmasi perusahaan.</p>
  </div>
</template>
