<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/layouts/AppLayout.vue';
import Toast from '@/components/ui/Toast.vue';

const route = useRoute();
const isAuthLayout = computed(() => route.meta.layout === 'auth');
</script>

<template>
    <router-view v-slot="{ Component }">
        <component :is="Component" v-if="isAuthLayout" />
        <AppLayout v-else><component :is="Component" /></AppLayout>
    </router-view>
    <Toast />
</template>
