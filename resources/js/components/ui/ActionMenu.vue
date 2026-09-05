<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
const props = defineProps({ open: Boolean, width: { type: String, default: 'w-44' } });
const emit = defineEmits(['toggle', 'close']);
const triggerRef = ref(null); const menuRef = ref(null); const pos = ref({ top: 0, left: 0 });
const place = () => {
    const trigger = triggerRef.value; const menu = menuRef.value; if (!trigger || !menu) return;
    const rect = trigger.getBoundingClientRect(); const menuWidth = menu.offsetWidth; const menuHeight = menu.offsetHeight;
    const openUp = rect.bottom + menuHeight + 8 > window.innerHeight;
    pos.value = {
        top: openUp ? rect.top - menuHeight - 6 : rect.bottom + 6,
        left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
    };
};
watch(() => props.open, (isOpen) => {
    if (!isOpen) { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); return; }
    nextTick(place);
    window.addEventListener('scroll', place, true); window.addEventListener('resize', place);
});
onBeforeUnmount(() => { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); });
</script>
<template>
    <span ref="triggerRef" class="inline-flex"><slot name="trigger" :toggle="() => emit('toggle')" /></span>
    <Teleport to="body">
        <div v-if="open" ref="menuRef" :style="{ position: 'fixed', top: `${pos.top}px`, left: `${pos.left}px` }" :class="['z-20 rounded-lg border border-[#E2E6EC] bg-white py-1 text-left shadow-lg', width]">
            <slot name="menu" :close="() => emit('close')" />
        </div>
    </Teleport>
</template>
