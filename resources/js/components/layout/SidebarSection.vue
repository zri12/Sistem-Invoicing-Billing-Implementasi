<script setup>
defineProps({ label: String, collapsed: Boolean });
</script>

<template>
  <section :class="collapsed ? 'mb-1.5' : 'mb-0.5'">
    <div :class="collapsed ? 'px-1 pb-1 pt-3 text-center text-[8px] font-semibold leading-tight tracking-[0.04em] text-[#8B96A5]' : 'px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-[#8B96A5]'">{{ label }}</div>
    <slot />
  </section>
</template>
