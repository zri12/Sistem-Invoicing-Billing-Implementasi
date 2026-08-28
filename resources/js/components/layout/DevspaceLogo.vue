<script setup>
const brandIconUrl = '/favicon.ico';
defineProps({ size: { type: Number, default: 26 } });
</script>

<template>
  <img :src="brandIconUrl" :width="size" :height="size" alt="DEVSPACE" class="shrink-0 object-contain" />
</template>
