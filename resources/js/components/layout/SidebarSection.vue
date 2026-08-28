<script setup>
defineProps({ label: String, collapsed: Boolean });
</script>

<template>
  <section :class="collapsed ? 'mb-3 pt-2 first:pt-0' : 'mb-0.5'">
    <div v-if="!collapsed" class="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-[#8B96A5]">{{ label }}</div>
    <slot />
  </section>
</template>
