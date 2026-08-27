<script setup>
import { computed } from 'vue'; const props = defineProps({ modelValue: Boolean, label: String, disabled: Boolean, id: String }); const emit = defineEmits(['update:modelValue']); const checkboxId = computed(() => props.id || `checkbox-${Math.random().toString(36).slice(2)}`);
</script>
<template><label :for="checkboxId" class="inline-flex items-center gap-2 text-[13px] text-[#172033]" :class="disabled && 'cursor-not-allowed opacity-60'"><input :id="checkboxId" type="checkbox" :checked="modelValue" :disabled="disabled" class="h-4 w-4 rounded border-[#E2E6EC] text-[#173B6C] focus:ring-[#173B6C]" @change="emit('update:modelValue', $event.target.checked)" /><span><slot>{{ label }}</slot></span></label></template>
