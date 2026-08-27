<script setup>defineProps({ padding: { type: String, default: 'p-4' } });</script>
<template><section :class="['overflow-visible rounded-lg border border-[#E2E6EC] bg-white', padding]"><slot /></section></template>
