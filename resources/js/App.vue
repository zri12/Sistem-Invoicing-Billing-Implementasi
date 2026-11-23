<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/layouts/AppLayout.vue';
import Toast from '@/components/ui/Toast.vue';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const ui = useUiStore();
const isStandaloneLayout = computed(() => ['auth', 'preview'].includes(route.meta.layout));
</script>

<template>
    <router-view v-slot="{ Component }">
        <component :is="Component" v-if="isStandaloneLayout" />
        <AppLayout v-else><div v-if="ui.pageLoadError" class="m-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert">{{ ui.pageLoadError }} <button class="ml-2 underline" @click="ui.pageLoadError = ''; $router.go(0)">Muat ulang</button></div><div v-else-if="ui.pageLoading" class="space-y-5 p-6" role="status" aria-label="Data halaman sedang dimuat"><div class="h-6 w-44 animate-pulse rounded bg-[#E7EBF0]"></div><div class="h-4 w-72 max-w-full animate-pulse rounded bg-[#E7EBF0]"></div><div class="h-32 animate-pulse rounded-lg bg-white"></div><div class="h-56 animate-pulse rounded-lg bg-white"></div></div><component :is="Component" v-else /></AppLayout>
    </router-view>
    <div v-if="ui.pageLoading" role="status" aria-live="polite" class="fixed right-5 top-4 z-[100] rounded-lg border border-[#dce3ec] bg-white px-4 py-2 text-sm font-medium text-[#173B6C] shadow-md">Memuat data...</div>
    <Toast />
</template>
