<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Eye, EyeOff, Lock, User } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import DevspaceLogo from '@/components/layout/DevspaceLogo.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

const router = useRouter();
const auth = useAuthStore();
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const usernameError = ref('');
const passwordError = ref('');
const shapes = Array.from({ length: 8 }, (_, index) => ({ width: `${80 + index * 60}px`, height: `${80 + index * 60}px`, transform: `translate(-50%, -50%) rotate(${index * 15}deg)` }));

const useDemo = (demoUsername, demoPassword) => { username.value = demoUsername; password.value = demoPassword; error.value = ''; };
const submit = () => {
    error.value = '';
    usernameError.value = username.value.trim() ? '' : 'Username wajib diisi.';
    passwordError.value = password.value ? '' : 'Password wajib diisi.';
    if (usernameError.value || passwordError.value || loading.value) return;
    loading.value = true;
    window.setTimeout(() => {
        if (auth.loginDemo(username.value, password.value)) router.replace({ name: 'dashboard' });
        else error.value = auth.loginError || 'Username atau password salah. Silakan coba kembali.';
        loading.value = false;
    }, 600);
};
</script>

<template>
    <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F8FA] px-4">
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
            <span v-for="(shape, index) in shapes" :key="index" class="absolute left-1/2 top-1/2 rounded-lg border border-[#E2E6EC] opacity-40" :style="shape" />
        </div>
        <div class="relative z-10 w-full max-w-sm">
            <section class="rounded-xl border border-[#E2E6EC] bg-white p-6 shadow-sm sm:p-8">
                <div class="mb-8 flex flex-col items-center">
                    <DevspaceLogo :size="44" />
                    <div class="mt-3 text-center"><h1 class="text-xl font-bold text-[#172033]">DEVSPACE</h1><p class="mt-0.5 text-xs text-[#667085]">Sistem Invoicing &amp; Billing</p></div>
                </div>
                <form class="space-y-4" novalidate @submit.prevent="submit">
                    <BaseInput v-model="username" label="Username" placeholder="Masukkan username" autocomplete="username" :disabled="loading" :error="usernameError" required size="lg"><template #prefix><User :size="15" /></template></BaseInput>
                    <BaseInput v-model="password" label="Password" :type="showPassword ? 'text' : 'password'" placeholder="Masukkan password" autocomplete="current-password" :disabled="loading" :error="passwordError" required size="lg"><template #prefix><Lock :size="15" /></template><template #suffix><button type="button" :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'" class="flex items-center hover:text-[#667085]" :disabled="loading" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" :size="15" /><Eye v-else :size="15" /></button></template></BaseInput>
                    <p v-if="error" class="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{{ error }}</p>
                    <BaseButton type="submit" class="mt-2 w-full" size="lg" :disabled="loading">{{ loading ? 'Memproses...' : 'Masuk' }}</BaseButton>
                </form>
                <div class="mt-6 border-t border-[#E2E6EC] pt-4"><p class="mb-3 text-center text-xs text-[#9CA3AF]">Demo akun tersedia:</p><div class="grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" class="rounded border border-[#E2E6EC] px-3 py-2 text-left text-[11px] text-[#667085] hover:bg-gray-50" @click="useDemo('fazrilukman', 'admin123')"><span class="block font-medium text-[#172033]">Admin / Finance</span><span>fazrilukman</span></button><button type="button" class="rounded border border-[#E2E6EC] px-3 py-2 text-left text-[11px] text-[#667085] hover:bg-gray-50" @click="useDemo('fahminashruddin', 'manager123')"><span class="block font-medium text-[#172033]">Pimpinan / Manager</span><span>fahminashruddin</span></button></div></div>
            </section>
            <p class="mt-6 text-center text-xs text-[#9CA3AF]">PT. Ruang Kreasi Aplikasi © 2026</p>
        </div>
    </main>
</template>
