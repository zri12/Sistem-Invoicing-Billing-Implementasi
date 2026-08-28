<script setup>
import { computed } from 'vue';
import { ArrowLeft, Download, Printer } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useInvoiceStore } from '@/stores/invoice';
import { useSettingsStore } from '@/stores/settings';
import { masterDataConfig } from '@/data/masterDataMock';
import { formatCurrency, formatDate } from '@/utils/formatters';
import BaseButton from '@/components/ui/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const store = useInvoiceStore();
const settings = useSettingsStore();
const invoice = computed(() => store.previewInvoice?.id === route.params.id ? store.previewInvoice : store.getInvoiceById(route.params.id));
const account = computed(() => masterDataConfig.account.records.find((record) => record.id === invoice.value?.accountId));
const client = computed(() => masterDataConfig.client.records.find((record) => record.id === invoice.value?.clientId));
const subtotal = computed(() => invoice.value?.items.reduce((sum, item) => sum + item.price * item.qty, 0) || 0);
const total = computed(() => subtotal.value - (invoice.value?.discount || 0));
const company = computed(() => settings.company);
const template = computed(() => settings.invoiceTemplate);
</script>

<template>
  <main class="min-h-screen bg-[#E8ECF2]">
    <header class="invoice-toolbar sticky top-0 z-10 flex h-[52px] items-center justify-between border-b border-[#D8DEE8] bg-white px-5"><BaseButton size="sm" variant="ghost" @click="router.back()"><ArrowLeft :size="15" />Kembali</BaseButton><div class="flex items-center gap-2"><BaseButton size="sm" variant="secondary" disabled title="PDF server-side belum diimplementasikan"><Download :size="15" />Unduh PDF</BaseButton><BaseButton size="sm" @click="window.print()"><Printer :size="15" />Cetak</BaseButton></div></header>
    <section v-if="invoice" class="invoice-print-shell mx-auto flex max-w-[210mm] justify-center p-4 md:p-8">
      <article class="invoice-document invoice-print relative min-h-[297mm] w-[210mm] max-w-full overflow-hidden bg-white px-[20mm] py-[16mm] text-[12px] text-[#171717] shadow-sm">
        <div class="invoice-background invoice-background--top pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="invoice-background invoice-background--bottom pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="pointer-events-none absolute right-0 top-0 h-[74px] w-[5px] bg-[#626ca8]" /><div class="pointer-events-none absolute right-0 top-[74px] h-[63px] w-[5px] bg-[#d9e1f3]" /><div class="pointer-events-none absolute right-0 top-[137px] h-[62px] w-[5px] bg-[#ebeff8]" /><div class="pointer-events-none absolute bottom-0 left-0 h-[74px] w-[5px] bg-[#626ca8]" /><div class="pointer-events-none absolute bottom-[74px] left-0 h-[63px] w-[5px] bg-[#d9e1f3]" />
        <div class="relative flex min-h-[265mm] flex-col"><header class="grid grid-cols-[1fr_1.45fr] items-center gap-6"><img v-if="template.showLogo" :src="company.logoUrl" :alt="company.name" class="h-[46px] w-auto max-w-[235px] object-contain object-left" /><div v-if="template.showTagline" class="text-center"><p class="text-[15px] font-bold text-[#444]">{{ company.tagline }}</p><p class="mt-0.5 text-[9px] text-[#777]">Website: {{ company.website }} | Email: {{ company.email }}</p></div></header>
          <section class="mt-14 grid grid-cols-[1fr_auto] items-start gap-8"><div class="space-y-1.5 text-[12px] leading-tight"><p><strong class="inline-block w-[112px]">Invoice Name</strong><span>: {{ invoice.name }}</span></p><p v-if="template.showInvoiceDate"><strong class="inline-block w-[112px]">Invoice Date</strong><span>: {{ formatDate(invoice.date) }}</span></p><p v-if="template.showDueDate"><strong class="inline-block w-[112px]">Due Date</strong><span>: {{ formatDate(invoice.dueDate) }}</span></p></div><div class="min-w-[210px] text-right"><h1 v-if="template.showTitle" class="text-[16px] font-bold">{{ template.title }}</h1><p v-if="template.showNumber" class="mt-1 text-[12px]">No. {{ invoice.number }}</p></div></section>
          <section class="mt-10 grid grid-cols-2 gap-8"><div v-if="template.showClient"><p class="font-bold">Bill To:</p><p class="mt-1 text-[12px] leading-[1.35]">{{ invoice.client }}<br />{{ client?.alamat || '-' }}<br /><span v-if="client?.phone">Ph: {{ client.phone }}</span><span v-else-if="client?.email">{{ client.email }}</span></p></div><div class="pl-2"><p class="font-bold">Total Due:</p><p class="mt-1 text-[13px]">{{ formatCurrency(total) }}</p></div></section>
          <table v-if="template.showItems" class="mt-12 w-full border-collapse text-[12px] leading-tight"><thead class="bg-[#f4f4f4]"><tr class="border border-[#7b7b7b]"><th class="border-r border-[#7b7b7b] px-2 py-2 text-center align-middle font-bold">Item Description</th><th class="w-[19%] border-r border-[#7b7b7b] px-2 py-2 text-center align-middle font-bold">Price</th><th class="w-[12%] border-r border-[#7b7b7b] px-2 py-2 text-center align-middle font-bold">Qty</th><th class="w-[21%] px-2 py-2 text-center align-middle font-bold">Total</th></tr></thead><tbody><tr v-for="item in invoice.items" :key="item.id" class="border border-t-0 border-[#7b7b7b]"><td class="border-r border-[#7b7b7b] px-2 py-1.5"><p>{{ item.description || item.product }}</p></td><td class="border-r border-[#7b7b7b] px-2 py-1.5 text-right">{{ formatCurrency(item.price) }}</td><td class="border-r border-[#7b7b7b] px-2 py-1.5 text-center">{{ item.qty }}</td><td class="px-2 py-1.5 text-right">{{ formatCurrency(item.price * item.qty) }}</td></tr></tbody></table>
          <section class="ml-auto mt-2 w-[52%] text-[12px] leading-tight"><div v-if="template.showSubtotal" class="flex justify-between py-1.5"><strong>Subtotal</strong><span>{{ formatCurrency(subtotal) }}</span></div><div v-if="template.showDiscount" class="flex justify-between py-1.5"><strong>Discount</strong><span>{{ invoice.discount ? formatCurrency(invoice.discount) : '0' }}</span></div><div v-if="template.showTotal" class="flex justify-between border-t border-[#565656] py-2 text-[13px]"><strong>Total Due</strong><strong>{{ formatCurrency(total) }}</strong></div></section>
          <section class="mt-11 grid grid-cols-2 gap-8 text-[12px] leading-[1.35]"><div v-if="template.showBankInfo"><p class="font-bold">Payment Method:</p><p class="mt-2 font-semibold">{{ account?.nama || '-' }} {{ account?.nomor || '' }}</p><p>{{ account?.atasNama || company.name }}</p><p>{{ account?.cabang || '' }}</p></div><div v-if="template.showTerms"><p class="font-bold">Terms &amp; Condition:</p><ul class="mt-2 list-disc space-y-1 pl-5"><li>{{ invoice.terms || 'Silakan lakukan pembayaran ke rekening yang tertera di atas.' }}</li><li>Mohon konfirmasi pembayaran melalui email balasan pada email tagihan ini.</li></ul></div></section>
          <section v-if="template.showStamp || template.showSignature" class="mt-auto flex justify-end pt-12"><div class="w-[210px] text-center text-[12px]"><p>{{ company.address?.split(',')[0] || 'Bandung' }}, {{ formatDate(invoice.date) }}</p><img v-if="template.showSignature && company.signatureUrl" :src="company.signatureUrl" alt="Tanda tangan" class="mx-auto my-2 h-9 max-w-40 object-contain" /><div v-else class="h-8" /><div v-if="template.showStamp" class="mx-auto flex h-[48px] w-[175px] items-center justify-center border border-[#444] bg-white/75 px-3"><img v-if="company.stampUrl" :src="company.stampUrl" alt="Cap perusahaan" class="h-10 max-w-[150px] object-contain" /><img v-else :src="company.logoUrl" :alt="company.name" class="h-8 max-w-[145px] object-contain" /></div><p v-if="template.showSignerName" class="mt-2 font-bold">{{ company.signerName }}</p><p v-if="template.showSignerPosition">{{ company.signerPosition }}</p><p>{{ company.name }}</p></div></section>
          <footer class="mt-10 flex items-end justify-between text-[10px]"><div><p v-if="template.showTitle">{{ template.title }}</p><p v-if="template.showNumber">No. {{ invoice.number }}</p></div><span>1</span></footer></div>
      </article>
    </section>
    <section v-else class="p-8 text-center text-sm text-[#667085]">Data preview tidak tersedia. Kembali ke daftar Invoice lalu pilih Preview.</section>
  </main>
</template>

<style>
.invoice-print { height: 297mm; isolation: isolate; }
.invoice-background { z-index: 0; background-image: url('/images/invoice/bg-invoice.png'); background-position: center; background-repeat: no-repeat; background-size: 100% 100%; }
.invoice-background--bottom { transform: rotate(180deg); }
.invoice-print > .relative { z-index: 1; }

@media print {
  @page { size: A4 portrait; margin: 0; }
  .invoice-toolbar { display: none !important; }
  .invoice-print-shell { display: block !important; max-width: none !important; padding: 0 !important; }
  .invoice-print { width: 210mm !important; min-height: 297mm !important; height: 297mm !important; box-shadow: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .invoice-background { display: block !important; }
}
</style>
