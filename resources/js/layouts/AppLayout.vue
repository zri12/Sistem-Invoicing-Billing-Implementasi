<script setup>import AppSidebar from '@/components/layout/AppSidebar.vue'; import AppTopbar from '@/components/layout/AppTopbar.vue';</script>
<template><div class="flex h-screen overflow-hidden bg-[#F7F8FA]"><AppSidebar /><div class="flex min-w-0 flex-1 flex-col overflow-hidden"><AppTopbar /><main class="flex-1 overflow-y-auto"><slot /></main></div></div></template>
