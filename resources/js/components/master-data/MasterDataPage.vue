<script setup>
import { computed, ref, watch } from 'vue';
import { MoreHorizontal, Plus, Search } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { masterDataConfig } from '@/data/masterDataMock';
import { formatCurrency } from '@/utils/formatters';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import Pagination from '@/components/ui/Pagination.vue';

const props = defineProps({ kind: { type: String, required: true } });
const auth = useAuthStore();
const ui = useUiStore();
const config = computed(() => masterDataConfig[props.kind]);
const clone = (value) => JSON.parse(JSON.stringify(value));
const data = ref(clone(config.value.records));
const search = ref('');
const statusFilter = ref('semua');
const page = ref(1);
const pageSize = 5;
const modalOpen = ref(false);
const editTarget = ref(null);
const menuOpen = ref(null);
const historyTarget = ref(null);
const confirmTarget = ref(null);
const formErrors = ref({});
const newForm = () => Object.fromEntries(config.value.fields.map((field) => [field.key, field.default ?? '']));
const form = ref(newForm());
const isReadOnly = computed(() => auth.role === 'manager');
const hasHistory = computed(() => Boolean(config.value.historyLabel));
const filtered = computed(() => data.value.filter((record) => {
    const query = search.value.trim().toLowerCase();
    const matchesSearch = !query || config.value.searchKeys.some((key) => String(record[key] || '').toLowerCase().includes(query));
    return matchesSearch && (statusFilter.value === 'semua' || record.status === statusFilter.value);
}));
const rows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const fieldFor = (key) => config.value.fields.find((field) => field.key === key);
const statusVariant = (status) => status === 'aktif' ? 'success' : 'default';
const canOpenMenu = computed(() => !isReadOnly.value || hasHistory.value);

watch([search, statusFilter], () => { page.value = 1; });
const openAdd = () => { editTarget.value = null; form.value = newForm(); formErrors.value = {}; modalOpen.value = true; };
const openEdit = (record) => { editTarget.value = record; form.value = Object.fromEntries(config.value.fields.map((field) => [field.key, record[field.key] ?? field.default ?? ''])); formErrors.value = {}; menuOpen.value = null; modalOpen.value = true; };
const validate = () => {
    const errors = {};
    config.value.fields.forEach((field) => {
        const value = String(form.value[field.key] ?? '').trim();
        if (field.required && !value) errors[field.key] = `${field.label} wajib diisi.`;
        if (field.type === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) errors[field.key] = 'Format email tidak valid.';
        if (field.type === 'number' && value !== '' && Number(value) < 0) errors[field.key] = 'Nilai tidak boleh kurang dari 0.';
    });
    formErrors.value = errors;
    return Object.keys(errors).length === 0;
};
const save = () => {
    if (!validate()) return;
    const saved = { ...form.value };
    if (props.kind === 'product') saved.harga = Number(saved.harga || 0);
    if (editTarget.value) {
        data.value = data.value.map((record) => record.id === editTarget.value.id ? { ...record, ...saved } : record);
        ui.notify(config.value.messages[1]);
    } else {
        const record = { id: `${props.kind}-${Date.now()}`, ...saved };
        if (props.kind === 'client' || props.kind === 'vendor') record.jumlah = 0;
        data.value = config.value.append ? [...data.value, record] : [record, ...data.value];
        ui.notify(config.value.messages[0]);
    }
    modalOpen.value = false;
};
const toggleStatus = () => {
    const target = confirmTarget.value;
    if (!target) return;
    data.value = data.value.map((record) => record.id === target.id ? { ...record, status: record.status === 'aktif' ? 'nonaktif' : 'aktif' } : record);
    ui.notify(props.kind === 'product' || props.kind === 'account' ? config.value.messages[2] : `${config.value.messages[2]} ${target.status === 'aktif' ? 'dinonaktifkan' : 'diaktifkan'}.`);
    confirmTarget.value = null;
    menuOpen.value = null;
};
const setValue = (key, value) => { form.value = { ...form.value, [key]: value }; if (formErrors.value[key]) formErrors.value = { ...formErrors.value, [key]: '' }; };
</script>

<template>
    <div class="p-6">
        <header class="mb-5 flex items-start justify-between"><div><h1 class="text-xl font-semibold text-[#172033]">{{ config.title }}</h1><p class="mt-0.5 text-sm text-[#667085]">{{ config.description }}</p></div><BaseButton v-if="!isReadOnly" @click="openAdd"><Plus :size="15" />{{ config.addLabel }}</BaseButton></header>

        <div v-if="!config.hideToolbar" class="mb-4 flex items-center gap-3"><BaseInput v-model="search" :placeholder="config.searchPlaceholder" class="max-w-xs flex-1"><template #prefix><Search :size="14" /></template></BaseInput><BaseSelect v-model="statusFilter" class="w-36" :options="[{ value: 'semua', label: 'Semua Status' }, { value: 'aktif', label: 'Aktif' }, { value: 'nonaktif', label: 'Nonaktif' }]" /></div>

        <section class="overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white"><table class="w-full min-w-[760px]"><thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th v-for="column in config.columns" :key="column[0]" :class="['px-4 py-3 text-left text-xs font-medium text-[#667085]', column[2] === 'primary' || column[2] === 'account' ? 'px-5' : '', column[2] === 'count' || column[2] === 'currency' ? 'text-right' : '']">{{ column[1] }}</th><th class="px-4 py-3 text-left text-xs font-medium text-[#667085]">Aksi</th></tr></thead><tbody><tr v-if="!rows.length"><td :colspan="config.columns.length + 1" class="px-5 py-12 text-center"><div class="flex flex-col items-center gap-2 text-[#9CA3AF]"><component :is="config.icon" :size="32" class="opacity-40" /><p class="text-sm">Belum ada data {{ config.title.toLowerCase() }}</p></div></td></tr><tr v-for="(record, index) in rows" :key="record.id" class="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"><td v-for="column in config.columns" :key="column[0]" :class="['px-4 py-3.5 text-sm text-[#667085]', column[2] === 'primary' || column[2] === 'account' ? 'px-5 font-medium text-[#172033]' : '', column[2] === 'currency' ? 'text-right font-medium text-[#172033]' : '', column[2] === 'description' ? 'max-w-xs truncate' : '', column[2] === 'mono' ? 'font-mono' : '']"><template v-if="column[2] === 'status'"><BaseBadge :variant="statusVariant(record.status)">{{ record.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}</BaseBadge></template><template v-else-if="column[2] === 'currency'">{{ formatCurrency(record[column[0]]) }}</template><template v-else-if="column[2] === 'account'"><span class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded bg-[#EEF2F8]"><component :is="config.icon" :size="14" class="text-[#173B6C]" /></span>{{ record[column[0]] }}</span></template><template v-else>{{ record[column[0]] || '-' }}</template></td><td class="relative px-4 py-3.5"><button v-if="canOpenMenu" :aria-label="`Aksi ${record.nama}`" class="rounded p-1.5 text-[#667085] hover:bg-gray-100" @click="menuOpen = menuOpen === record.id ? null : record.id"><MoreHorizontal :size="15" /></button><div v-if="menuOpen === record.id" :class="['absolute right-4 z-20 w-44 rounded-lg border border-[#E2E6EC] bg-white py-1 shadow-lg', index >= rows.length - 3 ? 'bottom-10' : 'top-10']"><button v-if="!isReadOnly" class="w-full px-4 py-2 text-left text-sm text-[#172033] hover:bg-gray-50" @click="openEdit(record)">Edit</button><button v-if="hasHistory" class="w-full px-4 py-2 text-left text-sm text-[#172033] hover:bg-gray-50" @click="menuOpen = null; historyTarget = record">{{ config.historyLabel }}</button><button v-if="!isReadOnly" class="w-full px-4 py-2 text-left text-sm text-[#172033] hover:bg-gray-50" @click="confirmTarget = record">{{ record.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan' }}</button></div></td></tr></tbody></table><Pagination :page="page" :total="filtered.length" :per-page="pageSize" @change="page = $event" /></section>

        <BaseModal :open="modalOpen" :title="`${editTarget ? 'Edit' : 'Tambah'} ${config.title === 'Produk & Layanan' ? 'Produk / Layanan' : config.title}`" @close="modalOpen = false"><div class="space-y-4"><div v-for="row in config.formRows" :key="row.join('-')" :class="row.length === 2 ? 'grid grid-cols-2 gap-4' : ''"><template v-for="key in row" :key="key"><BaseTextarea v-if="fieldFor(key).type === 'textarea'" :model-value="form[key]" :label="fieldFor(key).label" :placeholder="fieldFor(key).placeholder" :required="fieldFor(key).required" :error="formErrors[key]" :rows="3" @update:model-value="setValue(key, $event)" /><BaseSelect v-else-if="fieldFor(key).type === 'select'" :model-value="form[key]" :label="fieldFor(key).label" :options="fieldFor(key).options" :required="fieldFor(key).required" :error="formErrors[key]" @update:model-value="setValue(key, $event)" /><BaseInput v-else :model-value="form[key]" :label="fieldFor(key).label" :type="fieldFor(key).type || 'text'" :placeholder="fieldFor(key).placeholder" :required="fieldFor(key).required" :error="formErrors[key]" :input-class="fieldFor(key).mono ? 'font-mono' : ''" @update:model-value="setValue(key, $event)" /></template></div></div><template #footer><BaseButton variant="secondary" @click="modalOpen = false">Batal</BaseButton><BaseButton @click="save">Simpan</BaseButton></template></BaseModal>

        <BaseModal :open="Boolean(historyTarget)" :title="config.historyTitle" @close="historyTarget = null"><p v-if="historyTarget" class="mb-4 text-sm text-[#667085]">{{ config.historySubtitle(historyTarget) }}</p><dl v-if="historyTarget" class="overflow-hidden rounded-lg border border-[#E2E6EC]"><div v-for="field in config.historyFields(historyTarget)" :key="field[0]" class="grid grid-cols-2 gap-4 border-b border-[#E2E6EC] px-4 py-3 last:border-0"><dt class="text-sm text-[#667085]">{{ field[0] }}</dt><dd class="break-words text-right text-sm font-medium text-[#172033]">{{ field[1] || '-' }}</dd></div></dl><template #footer><BaseButton @click="historyTarget = null">Tutup</BaseButton></template></BaseModal>
        <ConfirmDialog :open="Boolean(confirmTarget)" :title="`Ubah status ${config.title}`" :message="confirmTarget ? `Anda yakin ingin ${confirmTarget.status === 'aktif' ? 'menonaktifkan' : 'mengaktifkan'} data ini?` : ''" :confirm-label="confirmTarget?.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'" :danger="confirmTarget?.status === 'aktif'" @cancel="confirmTarget = null" @confirm="toggleStatus" />
        <button v-if="menuOpen" aria-label="Tutup menu aksi" class="fixed inset-0 z-10 cursor-default" @click="menuOpen = null" />
    </div>
</template>
