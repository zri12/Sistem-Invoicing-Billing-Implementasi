<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/layouts/AppLayout.vue';
import Toast from '@/components/ui/Toast.vue';

const route = useRoute();
const isStandaloneLayout = computed(() => ['auth', 'preview'].includes(route.meta.layout));
</script>

<template>
    <router-view v-slot="{ Component }">
        <component :is="Component" v-if="isStandaloneLayout" />
        <AppLayout v-else><component :is="Component" /></AppLayout>
    </router-view>
    <Toast />
</template>
