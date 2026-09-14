<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { Save } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';
import settingsService from '@/services/settingsService';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import InvoiceDocument from '@/components/invoice/InvoiceDocument.vue';

const settings = useSettingsStore();
const ui = useUiStore();
const auth = useAuthStore();
const form = reactive({ ...settings.invoiceTemplate });
const templateInvoice = ref(null);
const templateCompany = ref(null);
const templateClient = ref(null);
const templateAccount = ref(null);
const templateReady = ref(false);
const readOnly = computed(() => auth.role === 'manager');
const controls = [
    ['showLogo', 'Logo Perusahaan'], ['showTagline', 'Tagline / Deskripsi'],
    ['showTitle', 'Judul Invoice'], ['showNumber', 'Nomor Invoice'],
    ['showInvoiceDate', 'Tanggal Invoice'], ['showDueDate', 'Tanggal Jatuh Tempo'],
    ['showClient', 'Data Klien'], ['showItems', 'Rincian Item'],
    ['showSubtotal', 'Subtotal'], ['showDiscount', 'Diskon'], ['showTotal', 'Total'],
    ['showBankInfo', 'Informasi Rekening Bank'], ['showTerms', 'Terms & Conditions'],
    ['showStamp', 'Cap Perusahaan'], ['showSignature', 'Tanda Tangan'],
    ['showSignerName', 'Nama Penanda Tangan'], ['showSignerPosition', 'Jabatan Penanda Tangan'],
];

onMounted(async () => {
    try {
        const preview = await settingsService.getTemplatePreview();
        Object.assign(form, preview.template);
        templateCompany.value = preview.company;
        templateInvoice.value = preview.invoice;
        templateClient.value = preview.client;
        templateAccount.value = preview.account;
    } catch (error) {
        ui.notify(error.response?.data?.message || 'Gagal memuat data template invoice.', 'error');
    } finally {
        templateReady.value = true;
    }
});

const save = async () => {
    try {
        await settings.saveTemplate(form);
        ui.notify('Template berhasil disimpan.');
    } catch (error) {
        ui.notify(error.response?.data?.message || 'Gagal menyimpan template.', 'error');
    }
};
</script>

<template>
    <div class="p-6">
        <header class="mb-5 flex justify-between gap-4">
            <div>
                <h1 class="text-xl font-semibold">Template Invoice</h1>
                <p class="mt-0.5 text-sm text-[#667085]">Konfigurasi tampilan dan elemen invoice yang diterbitkan.</p>
            </div>
            <BaseButton v-if="!readOnly" @click="save"><Save :size="14" />Simpan Template</BaseButton>
        </header>

        <div class="grid gap-6 xl:grid-cols-5">
            <BaseCard class="space-y-3 xl:col-span-2" padding="p-5">
                <h2 class="text-sm font-semibold">Elemen Invoice</h2>
                <BaseInput v-model="form.title" label="Judul Invoice" :disabled="readOnly" />
                <label v-for="field in controls" :key="field[0]" class="flex items-center justify-between gap-3 text-sm">
                    <span>{{ field[1] }}</span>
                    <input v-model="form[field[0]]" type="checkbox" :disabled="readOnly" />
                </label>
            </BaseCard>

            <BaseCard class="xl:col-span-3" padding="p-5">
                <p class="mb-3 text-center text-xs text-[#667085]">Preview Template (data invoice terbaru)</p>
                <div v-if="templateInvoice" class="overflow-auto">
                    <InvoiceDocument
                        :invoice="templateInvoice"
                        :company="templateCompany"
                        :client="templateClient"
                        :payment-account="templateAccount"
                        :template="form"
                        class="mx-auto origin-top scale-[.67]"
                    />
                </div>
                <p v-else-if="templateReady" class="py-12 text-center text-sm text-[#667085]">Belum ada invoice tersimpan untuk ditampilkan.</p>
            </BaseCard>
        </div>
    </div>
</template>
