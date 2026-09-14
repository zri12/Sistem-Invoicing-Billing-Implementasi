<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ArrowLeft, Download, LoaderCircle, Printer } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useInvoiceStore } from '@/stores/invoice';
import { useSettingsStore } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';
import BaseButton from '@/components/ui/BaseButton.vue';
import InvoiceDocument from '@/components/invoice/InvoiceDocument.vue';

const route = useRoute();
const router = useRouter();
const store = useInvoiceStore();
const settings = useSettingsStore();
const ui = useUiStore();
const downloading = ref(false);
let warmTimer = null;

const invoice = computed(() => store.getInvoiceById(route.params.id));
const previewReady = computed(() => Boolean(
    invoice.value
    && store.hasInvoiceDetails(route.params.id)
    && settings.invoiceDocumentLoaded
));
const client = computed(() => invoice.value?.clientDetails || null);
const account = computed(() => invoice.value?.accountDetails || null);

const warmPdf = () => {
    if (warmTimer) window.clearTimeout(warmTimer);
    // Data preview harus selalu mendapat prioritas. Pemanasan PDF baru dimulai
    // setelah dokumen lengkap terlihat, sehingga tidak membuat layar awal lama.
    warmTimer = window.setTimeout(() => {
        window.fetch(`/api/invoices/${route.params.id}/pdf?warm=1`, {
            credentials: 'same-origin',
            headers: { Accept: 'application/pdf' },
        }).catch(() => {});
    }, 700);
};

const loadPreview = () => {
    if (warmTimer) window.clearTimeout(warmTimer);
    void Promise.all([
        store.fetchOne(route.params.id),
        settings.ensureInvoiceDocument(),
    ]).then(warmPdf).catch(() => {});
};

onMounted(() => {
    // Router juga memulai request ini. Store menduplikasi request yang sama,
    // sehingga komponen dapat memastikan data lengkap tanpa meminta dua kali.
    loadPreview();
});

watch(() => route.params.id, loadPreview);

onBeforeUnmount(() => {
    if (warmTimer) window.clearTimeout(warmTimer);
});

const printInvoice = () => {
    if (previewReady.value) window.open(`/invoice/${invoice.value.id}/print`, '_blank');
};

const downloadPdf = async () => {
    if (!previewReady.value) return;

    downloading.value = true;
    try {
        // Server menangani unduhan agar tidak bergantung pada dukungan canvas,
        // popup, atau modul PDF browser pengguna.
        await store.downloadPdf(invoice.value.id, `invoice-${invoice.value.number}.pdf`);
    } catch {
        ui.notify('Gagal mengunduh PDF invoice.', 'error');
    } finally {
        downloading.value = false;
    }
};
</script>

<template>
    <main class="min-h-screen bg-[#E8ECF2]">
        <header class="invoice-toolbar sticky top-0 flex h-[52px] items-center justify-between border-b border-[#D8DEE8] bg-white px-5">
            <BaseButton size="sm" variant="ghost" @click="router.back()"><ArrowLeft :size="15" />Kembali</BaseButton>
            <div class="flex gap-2">
                <BaseButton size="sm" variant="secondary" :loading="downloading" :disabled="!previewReady" @click="downloadPdf"><Download :size="15" />Simpan PDF</BaseButton>
                <BaseButton size="sm" :disabled="!previewReady" @click="printInvoice"><Printer :size="15" />Cetak</BaseButton>
            </div>
        </header>
        <section v-if="previewReady" class="invoice-print-shell mx-auto flex w-full justify-center overflow-x-auto p-4 md:p-8">
            <InvoiceDocument :key="invoice.id" :invoice="invoice" :company="settings.company" :client="client" :payment-account="account" :template="settings.invoiceTemplate" class="shadow-sm" />
        </section>
        <section v-else class="invoice-print-shell flex w-full items-center justify-center p-8">
            <div class="flex items-center gap-2 text-sm text-[#667085]"><LoaderCircle :size="18" class="animate-spin" />Menyiapkan invoice...</div>
        </section>
    </main>
</template>

<style>
.invoice-toolbar { z-index: 50 !important; }
.invoice-print-shell { min-height: calc(100vh - 52px); }
@media print {
    @page { size: A4 portrait; margin: 0; }
    html, body, #app { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .invoice-toolbar { display: none !important; }
    .invoice-print-shell { display: block !important; min-height: 0 !important; padding: 0 !important; overflow: visible !important; }
    .invoice-print { position: static !important; width: 210mm !important; min-height: 297mm !important; box-shadow: none !important; }
}
</style>
