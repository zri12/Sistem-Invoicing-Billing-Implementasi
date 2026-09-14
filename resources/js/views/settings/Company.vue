<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { Save, Upload } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';

const settings = useSettingsStore();
const auth = useAuthStore();
const ui = useUiStore();
const form = reactive({ ...settings.company });
const files = reactive({ logo: null, stamp: null, signature: null });
const readOnly = computed(() => auth.role === 'manager');
const ready = ref(settings.loaded);
onMounted(async () => {
    try {
        await settings.ensure();
        Object.assign(form, settings.company);
    } finally {
        ready.value = true;
    }
});
const fieldToFileKey = { logoUrl: 'logo', stampUrl: 'stamp', signatureUrl: 'signature' };
const choose = (key, event) => {
    const file = event.target.files?.[0];
    if (file?.type.startsWith('image/')) {
        if (form[key]?.startsWith('blob:')) URL.revokeObjectURL(form[key]);
        form[key] = URL.createObjectURL(file);
        files[fieldToFileKey[key]] = file;
    }
};
const save = async () => {
    try {
        await settings.saveCompany(form, files);
        ui.notify('Data perusahaan berhasil disimpan.');
    } catch (error) {
        const validationErrors = error.response?.data?.errors;
        const detail = validationErrors ? Object.values(validationErrors).flat()[0] : null;
        ui.notify(detail || error.response?.data?.message || 'Gagal menyimpan data perusahaan.', 'error');
    }
};
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex justify-between gap-4"><div><h1 class="text-xl font-semibold">Data Perusahaan</h1><p class="mt-0.5 text-sm text-[#667085]">Informasi perusahaan yang ditampilkan pada invoice.</p></div><BaseButton v-if="!readOnly" @click="save"><Save :size="14" />Simpan Perubahan</BaseButton></header>
    <div v-if="ready" class="space-y-5">
      <BaseCard padding="p-5"><h2 class="mb-4 text-sm font-semibold">Logo Perusahaan</h2><div class="flex items-center gap-5"><img :src="form.logoUrl" class="h-20 w-28 object-contain" alt="Logo perusahaan" /><label v-if="!readOnly" class="cursor-pointer rounded-lg border-2 border-dashed border-[#E2E6EC] p-4 text-center text-xs text-[#667085]"><Upload :size="18" class="mx-auto mb-2" />Pilih logo<input type="file" accept="image/*" class="hidden" @change="choose('logoUrl', $event)" /></label></div></BaseCard>
      <BaseCard padding="p-5"><h2 class="mb-4 text-sm font-semibold">Identitas Perusahaan</h2><div class="grid gap-4 sm:grid-cols-2"><BaseInput v-model="form.name" class="sm:col-span-2" label="Nama Perusahaan" :disabled="readOnly" /><BaseInput v-model="form.code" label="Kode Perusahaan" :disabled="readOnly" /><BaseInput v-model="form.phone" label="Nomor Telepon" :disabled="readOnly" /><BaseInput v-model="form.email" label="Email" :disabled="readOnly" /><BaseInput v-model="form.website" label="Website" :disabled="readOnly" /><BaseTextarea v-model="form.address" class="sm:col-span-2" label="Alamat" :disabled="readOnly" /></div></BaseCard>
      <BaseCard padding="p-5"><h2 class="mb-4 text-sm font-semibold">Dokumen & Tanda Tangan</h2><div class="grid gap-4 sm:grid-cols-2"><div v-for="field in [['stampUrl', 'Cap Perusahaan'], ['signatureUrl', 'Tanda Tangan']]" :key="field[0]"><label class="mb-1.5 block text-sm font-medium">{{ field[1] }}</label><img v-if="form[field[0]]" :src="form[field[0]]" class="mb-2 h-16 w-32 object-contain" :alt="field[1]" /><label v-if="!readOnly" class="block cursor-pointer rounded-lg border-2 border-dashed border-[#E2E6EC] p-3 text-center text-xs text-[#667085]">Pilih gambar<input type="file" accept="image/*" class="hidden" @change="choose(field[0], $event)" /></label></div><BaseInput v-model="form.signerName" label="Nama Penanda Tangan" :disabled="readOnly" /><BaseInput v-model="form.signerPosition" label="Jabatan" :disabled="readOnly" /></div></BaseCard>
      <BaseCard padding="p-5"><h2 class="mb-4 text-sm font-semibold">Informasi Invoice</h2><div class="grid gap-4 sm:grid-cols-2"><BaseInput v-model="form.tagline" class="sm:col-span-2" label="Tagline" :disabled="readOnly" /><BaseInput v-model="form.signingCity" label="Kota Penandatanganan" placeholder="Contoh: Cimahi" :disabled="readOnly" /></div></BaseCard>
    </div>
  </div>
</template>
