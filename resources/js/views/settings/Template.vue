<script setup>
import { computed, reactive } from 'vue';
import { Save } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

const settings = useSettingsStore();
const ui = useUiStore();
const auth = useAuthStore();
const form = reactive({ ...settings.invoiceTemplate });
const readOnly = computed(() => auth.role === 'manager');
const controls = [
    ['showLogo', 'Logo Perusahaan'], ['showTagline', 'Tagline / Deskripsi'], ['showTitle', 'Judul Invoice'], ['showNumber', 'Nomor Invoice'], ['showInvoiceDate', 'Tanggal Invoice'], ['showDueDate', 'Tanggal Jatuh Tempo'], ['showClient', 'Data Klien'], ['showItems', 'Rincian Item'], ['showSubtotal', 'Subtotal'], ['showDiscount', 'Diskon'], ['showTotal', 'Total'], ['showBankInfo', 'Informasi Rekening Bank'], ['showTerms', 'Terms & Conditions'], ['showStamp', 'Cap Perusahaan'], ['showSignature', 'Tanda Tangan'], ['showSignerName', 'Nama Penanda Tangan'], ['showSignerPosition', 'Jabatan Penanda Tangan'],
];
const save = () => { settings.saveTemplate(form); ui.notify('Template berhasil disimpan.'); };
</script>

<template>
  <div class="p-6">
    <header class="mb-5 flex justify-between gap-4"><div><h1 class="text-xl font-semibold">Template Invoice</h1><p class="mt-0.5 text-sm text-[#667085]">Konfigurasi tampilan dan elemen invoice yang diterbitkan.</p></div><BaseButton v-if="!readOnly" @click="save"><Save :size="14" />Simpan Template</BaseButton></header>
    <div class="grid gap-6 xl:grid-cols-5">
      <div class="space-y-4 xl:col-span-2"><BaseCard padding="p-5"><h2 class="mb-4 text-sm font-semibold">Elemen Invoice</h2><BaseInput v-model="form.title" label="Judul Invoice" :disabled="readOnly" /><label v-for="field in controls" :key="field[0]" class="mt-3 flex items-center justify-between gap-3 text-sm"><span>{{ field[1] }}</span><input v-model="form[field[0]]" type="checkbox" :disabled="readOnly" /></label></BaseCard></div>
      <BaseCard class="xl:col-span-3" padding="p-5"><p class="mb-2 text-center text-xs text-[#667085]">Preview Template</p><div class="mx-auto max-w-[540px] border border-[#E2E6EC] bg-white p-8 text-xs"><div class="flex justify-between border-b-2 border-[#173B6C] pb-4"><div><img v-if="form.showLogo" :src="settings.company.logoUrl" :alt="settings.company.name" class="h-8 max-w-32 object-contain" /><p v-if="form.showTagline" class="mt-1 text-[#667085]">{{ settings.company.tagline }}</p></div><div class="text-right"><h2 v-if="form.showTitle" class="text-lg font-bold text-[#173B6C]">{{ form.title }}</h2><p v-if="form.showNumber">001/INV/RKA/VIII/26</p></div></div><div v-if="form.showClient" class="mt-5 font-semibold">Bill To: Graha Indonesia Telekomunika</div><div v-if="form.showItems" class="my-5 border border-[#E2E6EC] p-3">Pembayaran Ke-2 Pelunasan Project Spiritra <span class="float-right">Rp 3.000.000</span></div><div class="ml-auto w-52"><p v-if="form.showSubtotal">Subtotal <span class="float-right">Rp 3.000.000</span></p><p v-if="form.showDiscount">Diskon <span class="float-right">Rp 0</span></p><p v-if="form.showTotal" class="mt-1 border-t pt-1 font-bold">TOTAL <span class="float-right">Rp 3.000.000</span></p></div><p v-if="form.showBankInfo" class="mt-5">BCA 1394 5494 63 — {{ settings.company.name }}</p><p v-if="form.showTerms" class="mt-3">Silakan lakukan pembayaran ke rekening yang tertera.</p><div v-if="form.showStamp || form.showSignature" class="mt-6 text-right"><span v-if="form.showStamp" class="inline-block rounded-full border border-[#D4A72C] px-2 py-1 text-[#B8860B]">CAP DEMO</span><p v-if="form.showSignerName" class="mt-2">{{ settings.company.signerName }}</p><p v-if="form.showSignerPosition" class="text-[#667085]">{{ settings.company.signerPosition }}</p></div></div></BaseCard>
    </div>
  </div>
</template>
