<script setup>
import { computed, onMounted, reactive } from 'vue';
import { Save } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';

const settings = useSettingsStore();
const ui = useUiStore();
const auth = useAuthStore();
const form = reactive({ ...settings.invoiceNumbering });
const readOnly = computed(() => auth.role === 'manager');
onMounted(async () => { await settings.ensure(); Object.assign(form, settings.invoiceNumbering); });
const save = async () => {
    try {
        await settings.saveNumbering(form);
        ui.notify('Pengaturan penomoran berhasil disimpan.');
    } catch (error) {
        ui.notify(error.response?.data?.message || 'Gagal menyimpan pengaturan penomoran.', 'error');
    }
};
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex justify-between gap-4">
      <div><h1 class="text-xl font-semibold">Penomoran Invoice</h1><p class="mt-0.5 text-sm text-[#667085]">Konfigurasi format nomor invoice yang dibuat otomatis.</p></div>
      <BaseButton v-if="!readOnly" @click="save"><Save :size="14" />Simpan</BaseButton>
    </header>
    <BaseCard padding="p-5"><h2 class="mb-5 text-sm font-semibold">Konfigurasi Format</h2><div class="grid gap-4 sm:grid-cols-2"><BaseInput v-model="form.documentCode" label="Kode Dokumen" :disabled="readOnly" /><BaseInput v-model="form.companyCode" label="Kode Perusahaan" :disabled="readOnly" /><BaseInput v-model="form.digits" label="Digit Nomor" type="number" :disabled="readOnly" /><BaseSelect v-model="form.monthFormat" label="Format Bulan" :disabled="readOnly" :options="[{ value: 'romawi', label: 'Angka Romawi (VIII)' }, { value: 'angka', label: 'Angka (08)' }]" /><BaseSelect v-model="form.yearFormat" label="Format Tahun" :disabled="readOnly" :options="[{ value: '2digit', label: '2 Digit (26)' }, { value: '4digit', label: '4 Digit (2026)' }]" /><BaseSelect v-model="form.resetPolicy" label="Reset Urutan" :disabled="readOnly" :options="[{ value: 'belum', label: 'Belum Ditentukan' }, { value: 'bulanan', label: 'Setiap Bulan' }, { value: 'tahunan', label: 'Setiap Tahun' }, { value: 'tidak', label: 'Tidak Direset' }]" /></div></BaseCard>
    <p class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">Perubahan hanya berlaku untuk invoice baru. Kebijakan reset akhir masih memerlukan konfirmasi perusahaan.</p>
  </div>
</template>
