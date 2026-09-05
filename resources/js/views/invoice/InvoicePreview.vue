<script setup>
import { computed, onMounted, ref } from 'vue'; import { ArrowLeft, Download, Printer } from 'lucide-vue-next'; import { useRoute, useRouter } from 'vue-router'; import { useInvoiceStore } from '@/stores/invoice'; import { useSettingsStore } from '@/stores/settings'; import { useMasterDataStore } from '@/stores/masterData'; import { useUiStore } from '@/stores/ui'; import BaseButton from '@/components/ui/BaseButton.vue'; import InvoiceDocument from '@/components/invoice/InvoiceDocument.vue';
const route=useRoute(),router=useRouter(),store=useInvoiceStore(),settings=useSettingsStore(),master=useMasterDataStore(),ui=useUiStore(),downloading=ref(false); const invoice=computed(()=>store.previewInvoice?.id===route.params.id?store.previewInvoice:store.getInvoiceById(route.params.id)); const client=computed(()=>master.getClientById(invoice.value?.clientId));const account=computed(()=>master.getAccountById(invoice.value?.accountId));
onMounted(async()=>{await Promise.all([settings.ensure(),master.ensureAll()]);if(store.previewInvoice?.id!==route.params.id)await store.fetchOne(route.params.id).catch(()=>{})});
const downloadPdf=async()=>{
    downloading.value=true;
    try{await store.downloadPdf(invoice.value.id,`invoice-${invoice.value.number}.pdf`)}
    catch(error){ui.notify(error.response?.data?.message||'Gagal mengunduh PDF invoice.','error')}
    finally{downloading.value=false}
};
</script>
<template><main class="min-h-screen bg-[#E8ECF2]"><header class="invoice-toolbar sticky top-0 z-10 flex h-[52px] items-center justify-between border-b border-[#D8DEE8] bg-white px-5"><BaseButton size="sm" variant="ghost" @click="router.back()"><ArrowLeft :size="15"/>Kembali</BaseButton><div class="flex gap-2"><BaseButton size="sm" variant="secondary" :loading="downloading" @click="downloadPdf"><Download :size="15"/>Unduh PDF</BaseButton><BaseButton size="sm" @click="window.print()"><Printer :size="15"/>Cetak</BaseButton></div></header><section v-if="invoice" class="invoice-print-shell mx-auto flex w-full justify-center overflow-x-auto p-4 md:p-8"><InvoiceDocument :invoice="invoice" :company="settings.company" :client="client" :payment-account="account" :template="settings.invoiceTemplate" class="shadow-sm"/></section></main></template>
<style>@media print{.invoice-toolbar{display:none!important}.invoice-print-shell{display:block!important;padding:0!important}}</style>
