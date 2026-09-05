<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ArrowLeft, Eye, Plus, Trash2 } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useInvoiceStore } from '@/stores/invoice';
import { useUiStore } from '@/stores/ui';
import { useMasterDataStore } from '@/stores/masterData';
import { formatCurrency, todayIso } from '@/utils/formatters';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';

const route = useRoute(); const router = useRouter(); const store = useInvoiceStore(); const ui = useUiStore(); const masterData = useMasterDataStore();
const emptyItem = () => ({ id: `item-${Date.now()}`, productServiceId: '', product: '', description: '', price: 0, qty: 1 });
const empty = () => ({ name: '', clientId: '', client: '', date: todayIso(), dueDate: '', items: [emptyItem()], discount: 0, accountId: '', terms: 'Silakan lakukan pembayaran ke rekening yang tertera di atas', notes: '', status: 'draft' });
const form = reactive(empty()); const editing = computed(() => Boolean(route.params.id)); const current = computed(() => store.getInvoiceById(route.params.id));
const clients = computed(() => masterData.activeRecordsFor('client')); const products = computed(() => masterData.activeRecordsFor('product')); const accounts = computed(() => masterData.activeRecordsFor('account'));
const clientOptions = computed(() => [{ value: '', label: 'Pilih klien' }, ...clients.value.map((item) => ({ value: item.id, label: item.nama }))]); const accountOptions = computed(() => [{ value: '', label: 'Pilih rekening' }, ...accounts.value.map((item) => ({ value: item.id, label: `${item.nama} — ${item.nomor}` }))]);
const subtotal = computed(() => form.items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0)); const total = computed(() => Math.max(0, subtotal.value - (Number(form.discount) || 0))); const number = computed(() => editing.value ? current.value?.number : null);
const errors = reactive({}); const saving = ref(false);
const reset = (value) => { Object.assign(form, empty(), value ? JSON.parse(JSON.stringify(value)) : {}); Object.keys(errors).forEach((key) => delete errors[key]); };
watch(() => route.params.id, async () => { await masterData.ensureAll?.(); if (editing.value) { await store.fetchOne(route.params.id); reset(current.value); } else { reset(); } }, { immediate: true });
const setClient = () => { const client = clients.value.find((item) => item.id === form.clientId); form.client = client?.nama || ''; };
const setProduct = (item) => { const product = products.value.find((value) => value.id === item.productServiceId || value.nama === item.product); if (product) { item.productServiceId = product.id; item.product = product.nama; item.description = product.deskripsi; item.price = product.harga; } };
const addItem = () => form.items.push(emptyItem()); const removeItem = (index) => { if (form.items.length > 1) form.items.splice(index, 1); };
const validate = () => { Object.keys(errors).forEach((key) => delete errors[key]); if (!form.name.trim()) errors.name = 'Nama invoice wajib diisi.'; if (!form.clientId) errors.client = 'Pilih klien.'; if (!form.date) errors.date = 'Tanggal invoice wajib diisi.'; if (!form.dueDate) errors.dueDate = 'Jatuh tempo wajib diisi.'; if (!form.accountId) errors.account = 'Pilih rekening penerima.'; if (Number(form.discount) < 0) errors.discount = 'Diskon tidak boleh negatif.'; else if (Number(form.discount) > subtotal.value) errors.discount = 'Diskon tidak boleh melebihi subtotal.'; if (form.items.some((item) => !item.description || Number(item.price) <= 0 || Number(item.qty) <= 0)) errors.items = 'Lengkapi minimal satu item invoice.'; return Object.keys(errors).length === 0; };
const payload = (status = form.status) => ({ ...JSON.parse(JSON.stringify(form)), status, discount: Number(form.discount) || 0, items: form.items.map((item) => ({ ...item, productServiceId: item.productServiceId || null, price: Number(item.price) || 0, qty: Number(item.qty) || 0 })) });
const save = async (status) => {
    if (!validate() || saving.value) return;
    saving.value = true;
    try {
        const data = payload(status);
        if (editing.value) {
            await store.updateInvoice(route.params.id, data);
            ui.notify('Invoice berhasil diperbarui.');
            router.push({ name: 'invoice-detail', params: { id: route.params.id } });
        } else {
            const id = await store.createInvoice(data, status);
            ui.notify(status === 'published' ? 'Invoice berhasil diterbitkan.' : 'Draft invoice berhasil disimpan.');
            router.push({ name: 'invoice-detail', params: { id } });
        }
    } catch (error) {
        const apiErrors = error.response?.data?.errors;
        if (apiErrors) Object.entries(apiErrors).forEach(([key, messages]) => { errors[key] = messages[0]; });
        ui.notify(error.response?.data?.message || 'Gagal menyimpan invoice.', 'error');
    } finally {
        saving.value = false;
    }
};
const preview = () => { if (!validate()) return; store.setPreview({ ...payload(), id: editing.value ? route.params.id : 'preview', number: number.value || 'DRAFT' }); router.push({ name: 'invoice-preview', params: { id: editing.value ? route.params.id : 'preview' } }); };
</script>

<template>
  <div class="p-6"><header class="mb-5 flex items-start justify-between gap-4"><div class="flex items-start gap-3"><button class="mt-0.5 rounded p-1 text-[#667085] hover:bg-[#F5F7FA]" aria-label="Kembali ke invoice" @click="router.push({ name: 'invoice' })"><ArrowLeft :size="18" /></button><div><h1 class="text-xl font-semibold text-[#172033]">{{ editing ? 'Edit Invoice' : 'Buat Invoice' }}</h1><p class="mt-0.5 text-sm text-[#667085]">{{ editing ? 'Perbarui informasi dan rincian tagihan invoice.' : 'Buat invoice baru untuk klien perusahaan.' }}</p></div></div><div class="flex flex-wrap justify-end gap-2"><BaseButton v-if="!editing" variant="secondary" @click="save('draft')">Simpan Draft</BaseButton><BaseButton variant="secondary" @click="preview"><Eye :size="15" />Preview</BaseButton><BaseButton variant="primary" @click="save(editing ? current.status : 'published')">{{ editing ? 'Simpan Perubahan' : 'Simpan & Terbitkan' }}</BaseButton></div></header>
    <div class="grid gap-6 xl:grid-cols-3"><div class="space-y-5 xl:col-span-2"><BaseCard padding="p-5"><h2 class="mb-4 text-[15px] font-semibold text-[#172033]">Informasi Invoice</h2><div class="grid gap-4 sm:grid-cols-2"><BaseInput v-model="form.name" label="Nama Invoice" required placeholder="Contoh: Project Website" :error="errors.name" /><BaseInput :model-value="number || 'Dibuat otomatis setelah disimpan'" label="Nomor Invoice" disabled helper="Nomor invoice dibuat otomatis oleh sistem." /><BaseSelect v-model="form.clientId" label="Klien" required :options="clientOptions" :error="errors.client" @update:model-value="setClient" /><BaseInput v-model="form.date" label="Tanggal Invoice" type="date" required :error="errors.date" /><BaseInput v-model="form.dueDate" label="Jatuh Tempo" type="date" required :error="errors.dueDate" /><BaseSelect v-model="form.accountId" label="Rekening Penerima" required :options="accountOptions" :error="errors.account" /></div></BaseCard><BaseCard padding="p-5"><div class="mb-4 flex items-center justify-between"><h2 class="text-[15px] font-semibold text-[#172033]">Item Invoice</h2><BaseButton size="sm" variant="secondary" @click="addItem"><Plus :size="14" />Tambah Item</BaseButton></div><p v-if="errors.items" class="mb-3 text-xs text-red-600">{{ errors.items }}</p><div class="overflow-x-auto"><div class="min-w-[660px]"><div class="grid grid-cols-[1.25fr_1.45fr_110px_62px_120px_32px] gap-2 border-b border-[#E2E6EC] pb-2 text-xs font-medium text-[#667085]"><span>Produk / Layanan</span><span>Deskripsi</span><span>Harga</span><span>Qty</span><span class="text-right">Total</span><span /></div><div v-for="(item, index) in form.items" :key="item.id" class="grid grid-cols-[1.25fr_1.45fr_110px_62px_120px_32px] items-start gap-2 border-b border-[#F0F2F5] py-3"><BaseSelect v-model="item.product" :options="[{ value: '', label: 'Pilih produk' }, ...products.map((value) => ({ value: value.nama, label: value.nama }))]" @update:model-value="setProduct(item)" /><BaseInput v-model="item.description" placeholder="Deskripsi item" /><BaseInput v-model="item.price" type="number" input-class="text-right" /><BaseInput v-model="item.qty" type="number" input-class="text-center" /><span class="pt-2 text-right text-sm font-medium text-[#172033]">{{ formatCurrency(item.price * item.qty) }}</span><button :disabled="form.items.length === 1" class="mt-1 rounded p-1.5 text-[#98A2B3] hover:bg-red-50 hover:text-red-600 disabled:opacity-35" aria-label="Hapus item" @click="removeItem(index)"><Trash2 :size="15" /></button></div></div></div></BaseCard><BaseCard padding="p-5"><div class="grid gap-4 sm:grid-cols-2"><BaseTextarea v-model="form.terms" label="Syarat & Ketentuan" placeholder="Syarat pembayaran" :rows="4" /><BaseTextarea v-model="form.notes" label="Catatan" placeholder="Catatan tambahan" :rows="4" /></div></BaseCard></div><aside><BaseCard padding="p-5" class="xl:sticky xl:top-6"><h2 class="mb-4 text-[15px] font-semibold text-[#172033]">Ringkasan</h2><div class="space-y-3 border-b border-[#E2E6EC] pb-4 text-sm"><div class="flex justify-between text-[#667085]"><span>Subtotal</span><span>{{ formatCurrency(subtotal) }}</span></div><div class="flex items-start justify-between gap-3 text-[#667085]"><span class="pt-2">Diskon</span><BaseInput v-model="form.discount" type="number" :error="errors.discount" input-class="h-8 w-28 text-right" /></div></div><div class="mt-4 flex items-end justify-between"><span class="text-sm font-medium text-[#172033]">Total Tagihan</span><strong class="text-lg text-[#173B6C]">{{ formatCurrency(total) }}</strong></div></BaseCard></aside></div>
  </div>
</template>
