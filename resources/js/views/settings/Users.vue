<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { MoreHorizontal, Plus, UserCog } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { useUiStore } from '@/stores/ui';
import ActionMenu from '@/components/ui/ActionMenu.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const auth = useAuthStore();
const users = useUsersStore();
const ui = useUiStore();
const modalOpen = ref(false);
const editTarget = ref(null);
const menuOpen = ref(null);
const confirmTarget = ref(null);
const showPermissions = ref(false);
const errors = reactive({});
const blank = () => ({ name: '', email: '', username: '', password: '', role: 'admin', status: 'aktif' });
const form = reactive(blank());
const rolePermissions = [
    ['Dashboard & Laporan (lihat)', true, true], ['Kelola Klien', true, false], ['Lihat Klien & Vendor', true, true], ['Buat & Edit Invoice', true, false], ['Lihat Invoice & Preview', true, true], ['Catat Pembayaran', true, false], ['Lihat Pembayaran', true, true], ['Tambah Pemasukan Manual', true, false], ['Lihat Pemasukan', true, true], ['Tambah Pengeluaran', true, false], ['Lihat Pengeluaran', true, true], ['Data Perusahaan (edit)', true, false], ['Template & Penomoran Invoice', true, false], ['Kelola Pengguna', true, false],
];
const initials = (name) => name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
const roleLabel = (role) => role === 'admin' ? 'Admin / Finance' : 'Pimpinan / Manager';
const roleVariant = (role) => role === 'admin' ? 'info' : 'default';
const statusVariant = (status) => status === 'aktif' ? 'success' : 'default';
const resetErrors = () => Object.keys(errors).forEach((key) => delete errors[key]);
const openAdd = () => { editTarget.value = null; Object.assign(form, blank()); resetErrors(); modalOpen.value = true; };
const openEdit = (user) => { editTarget.value = user; Object.assign(form, { name: user.name, email: user.email, username: user.username, password: '', role: user.role, status: user.status }); resetErrors(); menuOpen.value = null; modalOpen.value = true; };
const valid = () => {
    resetErrors();
    if (!form.name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    if (!form.username.trim()) errors.username = 'Username wajib diisi.';
    if (!editTarget.value && !form.password) errors.password = 'Password wajib diisi.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Format email tidak valid.';
    const existing = users.findByUsername(form.username);
    if (existing && existing.id !== editTarget.value?.id) errors.username = 'Username sudah digunakan.';
    return !Object.keys(errors).length;
};
onMounted(() => users.ensure());
const save = async () => {
    if (!valid()) return;
    const payload = { ...form, name: form.name.trim(), username: form.username.trim(), email: form.email.trim() };
    if (editTarget.value) {
        if (editTarget.value.id === auth.user?.id && payload.role !== 'admin') { errors.role = 'Role pengguna aktif tidak dapat diturunkan.'; return; }
        if (!payload.password) delete payload.password;
        try {
            await users.updateUser(editTarget.value.id, payload);
            ui.notify('Data pengguna berhasil diperbarui.');
            modalOpen.value = false;
        } catch (error) {
            const apiErrors = error.response?.data?.errors;
            if (apiErrors) Object.entries(apiErrors).forEach(([key, messages]) => { errors[key] = messages[0]; });
            else ui.notify(error.response?.data?.message || 'Gagal memperbarui pengguna.', 'error');
        }
    } else {
        try {
            await users.addUser(payload);
            ui.notify('Pengguna berhasil ditambahkan.');
            modalOpen.value = false;
        } catch (error) {
            const apiErrors = error.response?.data?.errors;
            if (apiErrors) Object.entries(apiErrors).forEach(([key, messages]) => { errors[key] = messages[0]; });
            else ui.notify(error.response?.data?.message || 'Gagal menambahkan pengguna.', 'error');
        }
    }
};
const requestStatus = (user) => { menuOpen.value = null; if (user.id === auth.user?.id && user.status === 'aktif') { ui.notify('Pengguna yang sedang aktif tidak dapat dinonaktifkan.', 'error'); return; } confirmTarget.value = user; };
const changeStatus = async () => {
    try {
        await users.setStatus(confirmTarget.value.id);
        ui.notify('Status pengguna diperbarui.');
    } catch (error) {
        ui.notify(error.response?.data?.message || 'Gagal memperbarui status pengguna.', 'error');
    } finally {
        confirmTarget.value = null;
    }
};
const statusMessage = computed(() => confirmTarget.value?.status === 'aktif' ? 'Pengguna tidak dapat login sampai akun diaktifkan kembali.' : 'Pengguna dapat login kembali dengan akun demo yang aktif.');
</script>

<template>
  <div class="p-6">
    <header class="mb-5 flex items-start justify-between gap-4"><div><h1 class="text-xl font-semibold text-[#172033]">Pengguna & Hak Akses</h1><p class="mt-0.5 text-sm text-[#667085]">Kelola pengguna internal dan hak akses berdasarkan peran.</p></div><BaseButton @click="openAdd"><Plus :size="15" />Tambah Pengguna</BaseButton></header>
    <section class="mb-5 overflow-x-auto rounded-lg border border-[#E2E6EC] bg-white"><table class="w-full min-w-[760px]"><thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th class="px-5 py-3 text-left text-xs font-medium text-[#667085]">Nama</th><th class="px-4 py-3 text-left text-xs font-medium text-[#667085]">Username / Email</th><th class="px-4 py-3 text-left text-xs font-medium text-[#667085]">Role</th><th class="px-4 py-3 text-left text-xs font-medium text-[#667085]">Status</th><th class="px-4 py-3 text-center text-xs font-medium text-[#667085]">Aksi</th></tr></thead><tbody><tr v-for="(user, index) in users.users" :key="user.id" class="border-b border-[#F3F4F6] hover:bg-gray-50"><td class="px-5 py-3.5"><div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2F8] text-xs font-semibold text-[#173B6C]">{{ initials(user.name) }}</span><span class="text-sm font-medium text-[#172033]">{{ user.name }}</span></div></td><td class="px-4 py-3.5"><p class="text-sm text-[#667085]">{{ user.username }}</p><p class="text-xs text-[#9CA3AF]">{{ user.email }}</p></td><td class="px-4 py-3.5"><BaseBadge :variant="roleVariant(user.role)">{{ roleLabel(user.role) }}</BaseBadge></td><td class="px-4 py-3.5"><BaseBadge :variant="statusVariant(user.status)">{{ user.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}</BaseBadge></td><td class="px-4 py-3.5 text-center"><ActionMenu :open="menuOpen === user.id" width="w-40" @toggle="menuOpen = menuOpen === user.id ? null : user.id" @close="menuOpen = null"><template #trigger="{ toggle }"><button :aria-label="`Aksi ${user.name}`" class="rounded p-1.5 text-[#667085] hover:bg-gray-100" @click="toggle"><MoreHorizontal :size="15" /></button></template><template #menu><button class="w-full px-4 py-2 text-left text-sm text-[#172033] hover:bg-gray-50" @click="openEdit(user)">Edit</button><button class="w-full px-4 py-2 text-left text-sm text-[#172033] hover:bg-gray-50" @click="requestStatus(user)">{{ user.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan' }}</button></template></ActionMenu></td></tr></tbody></table></section>
    <section class="overflow-hidden rounded-lg border border-[#E2E6EC] bg-white"><button class="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50" @click="showPermissions = !showPermissions"><span class="flex items-center gap-2"><UserCog :size="16" class="text-[#667085]" /><span class="text-sm font-semibold text-[#172033]">Ringkasan Hak Akses Per Peran</span></span><span class="text-xs text-[#315DA8]">{{ showPermissions ? 'Sembunyikan' : 'Tampilkan' }}</span></button><div v-if="showPermissions" class="overflow-x-auto border-t border-[#E2E6EC]"><table class="w-full min-w-[620px]"><thead><tr class="border-b border-[#E2E6EC] bg-[#F9FAFB]"><th class="px-5 py-3 text-left text-xs font-medium text-[#667085]">Fitur / Aksi</th><th class="px-4 py-3 text-center text-xs font-medium text-[#173B6C]">Admin / Finance</th><th class="px-4 py-3 text-center text-xs font-medium text-purple-700">Pimpinan / Manager</th></tr></thead><tbody><tr v-for="permission in rolePermissions" :key="permission[0]" class="border-b border-[#F3F4F6]"><td class="px-5 py-2.5 text-sm text-[#172033]">{{ permission[0] }}</td><td class="px-4 py-2.5 text-center text-base" :class="permission[1] ? 'text-green-600' : 'text-gray-300'">{{ permission[1] ? '✓' : '—' }}</td><td class="px-4 py-2.5 text-center text-base" :class="permission[2] ? 'text-green-600' : 'text-gray-300'">{{ permission[2] ? '✓' : '—' }}</td></tr></tbody></table></div></section>
    <button v-if="menuOpen" aria-label="Tutup menu aksi" class="fixed inset-0 z-10 cursor-default" @click="menuOpen = null" />
    <BaseModal :open="modalOpen" :title="editTarget ? 'Edit Pengguna' : 'Tambah Pengguna'" @close="modalOpen = false"><div class="space-y-4"><BaseInput v-model="form.name" label="Nama Lengkap" required :error="errors.name" /><div class="grid gap-4 sm:grid-cols-2"><BaseInput v-model="form.username" label="Username" required :error="errors.username" /><BaseInput v-model="form.email" label="Email" type="email" :error="errors.email" /></div><BaseInput v-model="form.password" :label="editTarget ? 'Password (kosongkan jika tidak diubah)' : 'Password'" type="password" :required="!editTarget" :error="errors.password" placeholder="••••••••" /><div class="grid gap-4 sm:grid-cols-2"><BaseSelect v-model="form.role" label="Role" :options="[{ value: 'admin', label: 'Admin / Finance' }, { value: 'manager', label: 'Pimpinan / Manager' }]" :error="errors.role" /><BaseSelect v-model="form.status" label="Status" :options="[{ value: 'aktif', label: 'Aktif' }, { value: 'nonaktif', label: 'Nonaktif' }]" :error="errors.status" /></div></div><template #footer><BaseButton variant="secondary" @click="modalOpen = false">Batal</BaseButton><BaseButton @click="save">Simpan</BaseButton></template></BaseModal>
    <ConfirmDialog :open="Boolean(confirmTarget)" :title="confirmTarget?.status === 'aktif' ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'" :message="statusMessage" :confirm-label="confirmTarget?.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'" :danger="confirmTarget?.status === 'aktif'" @cancel="confirmTarget = null" @confirm="changeStatus" />
  </div>
</template>
