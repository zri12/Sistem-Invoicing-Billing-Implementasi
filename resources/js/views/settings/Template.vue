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
      <BaseCard class="xl:col-span-3" padding="p-5"><p class="mb-2 text-center text-xs text-[#667085]">Preview Template</p><div class="invoice-template-preview mx-auto max-w-[540px] border border-[#E2E6EC] bg-white p-8 text-xs text-[#171717]"><div class="grid grid-cols-[1fr_1.4fr] items-center gap-4"><img v-if="form.showLogo" :src="settings.company.logoUrl" :alt="settings.company.name" class="h-8 max-w-36 object-contain object-left" /><div v-if="form.showTagline" class="text-center"><p class="font-bold">{{ settings.company.tagline }}</p><p class="mt-0.5 text-[8px] text-[#777]">Website: {{ settings.company.website }} | Email: {{ settings.company.email }}</p></div></div><div class="mt-8 flex justify-between gap-4"><div class="space-y-1"><p><strong>Invoice Name</strong>: Project Spiritra</p><p v-if="form.showInvoiceDate"><strong>Invoice Date</strong>: 01 Agu 2026</p><p v-if="form.showDueDate"><strong>Due Date</strong>: 15 Agu 2026</p></div><div class="text-right"><h2 v-if="form.showTitle" class="font-bold">{{ form.title }}</h2><p v-if="form.showNumber">No. 001/INV/RKA/VIII/26</p></div></div><div class="mt-7 grid grid-cols-2 gap-5"><p v-if="form.showClient"><strong>Bill To:</strong><br />Graha Indonesia Telekomunika</p><p class="pl-2"><strong>Total Due:</strong><br />Rp 3.000.000</p></div><table v-if="form.showItems" class="mt-7 w-full border-collapse"><thead class="bg-[#f4f4f4]"><tr class="border border-[#7b7b7b]"><th class="border-r border-[#7b7b7b] px-2 py-1 text-left">Item Description</th><th class="border-r border-[#7b7b7b] px-2 py-1 text-right">Price</th><th class="border-r border-[#7b7b7b] px-2 py-1">Qty</th><th class="px-2 py-1 text-right">Total</th></tr></thead><tbody><tr class="border border-t-0 border-[#7b7b7b]"><td class="border-r border-[#7b7b7b] px-2 py-1">Pembayaran Ke-2 Pelunasan Project Spiritra</td><td class="border-r border-[#7b7b7b] px-2 py-1 text-right">Rp 3.000.000</td><td class="border-r border-[#7b7b7b] px-2 py-1 text-center">1</td><td class="px-2 py-1 text-right">Rp 3.000.000</td></tr></tbody></table><div class="ml-auto mt-2 w-1/2"><p v-if="form.showSubtotal" class="flex justify-between py-1"><strong>Subtotal</strong><span>Rp 3.000.000</span></p><p v-if="form.showDiscount" class="flex justify-between py-1"><strong>Discount</strong><span>0</span></p><p v-if="form.showTotal" class="flex justify-between border-t border-[#565656] py-1 font-bold">Total Due <span>Rp 3.000.000</span></p></div><div class="mt-8 grid grid-cols-2 gap-4"><p v-if="form.showBankInfo"><strong>Payment Method:</strong><br />BCA 1394 5494 63<br />{{ settings.company.name }}</p><p v-if="form.showTerms"><strong>Terms &amp; Condition:</strong><br />Silakan lakukan pembayaran ke rekening yang tertera.</p></div><div v-if="form.showStamp || form.showSignature" class="mt-8 text-right"><div v-if="form.showStamp" class="ml-auto flex h-8 w-28 items-center justify-center border border-[#444]"><img :src="settings.company.logoUrl" :alt="settings.company.name" class="h-5 max-w-24 object-contain" /></div><p v-if="form.showSignerName" class="mt-1 font-bold">{{ settings.company.signerName }}</p><p v-if="form.showSignerPosition">{{ settings.company.signerPosition }}</p></div></div></BaseCard>
    </div>
  </div>
</template>

<style scoped>
.invoice-template-preview {
  position: relative;
  width: 210mm;
  max-width: 100%;
  min-height: 297mm;
  padding: 16mm 20mm !important;
  font-size: 12px;
  overflow: hidden;
  background-image: url('/images/invoice/bg-invoice.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.invoice-template-preview::before,
.invoice-template-preview::after {
  position: absolute;
  z-index: 0;
  width: 12px;
  height: 200px;
  content: '';
  background: linear-gradient(to bottom, #626ca8 0 37%, #d9e1f3 37% 69%, #ebeff8 69% 100%);
}
.invoice-template-preview::before { top: 0; right: 0; }
.invoice-template-preview::after { bottom: 0; left: 0; transform: rotate(180deg); }
.invoice-template-preview > * { position: relative; z-index: 1; }
.invoice-template-preview table { margin-top: 12mm; }
.invoice-template-preview > div:nth-last-child(1) { margin-top: auto; }
</style>
