<script setup>
import { computed, ref, watch } from 'vue';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({ data: { type: Array, required: true } });
const selectedKey = ref(null);
const hoveredKey = ref(null);
watch(() => props.data.map((item) => item.key).join(','), () => { selectedKey.value = null; hoveredKey.value = null; });
const active = computed(() => props.data.find((item) => item.key === hoveredKey.value)
    || props.data.find((item) => item.key === selectedKey.value));
const activeIndex = computed(() => props.data.findIndex((item) => item.key === active.value?.key));
const tooltipPosition = computed(() => `clamp(105px, ${100 * (activeIndex.value + 0.5) / Math.max(1, props.data.length)}%, calc(100% - 105px))`);
const ceiling = computed(() => {
    const value = Math.max(0, ...props.data.flatMap((item) => [item.income, item.expense]));
    if (!value) return 1000;
    const rawStep = value / 4;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const unit = rawStep / magnitude;
    const step = (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * magnitude;
    return step * 4;
});
const ticks = computed(() => [4, 3, 2, 1, 0].map((part) => ceiling.value * part / 4));
const shortRupiah = (value) => `Rp ${new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
const barHeight = (value) => `${100 * Math.max(0, value) / ceiling.value}%`;
const activate = (item) => { selectedKey.value = selectedKey.value === item.key ? null : item.key; };
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-[#172033]">Pemasukan vs Pengeluaran</h2>
      <div class="flex gap-4 text-xs text-[#667085]" aria-label="Keterangan warna grafik">
        <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-[#173B6C]"></span>Pemasukan</span>
        <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-[#EF4444]"></span>Pengeluaran</span>
      </div>
    </div>
    <div class="overflow-x-auto">
      <div class="min-w-[420px] pt-2">
        <div class="relative h-[180px] pl-[72px]">
          <div class="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            <div v-for="tick in ticks" :key="tick" class="flex items-center gap-2">
              <span class="w-[64px] shrink-0 text-right text-[11px] leading-none text-[#667085]">{{ shortRupiah(tick) }}</span>
              <span class="h-px flex-1 bg-[#E7EBF0]"></span>
            </div>
          </div>
          <div class="relative flex h-full w-full">
            <button v-for="item in data" :key="item.key" type="button" class="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-1 rounded-sm hover:bg-[#F5F7FA] focus-visible:bg-[#F5F7FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#173B6C]"
                    :aria-label="`${item.labelLong}: pemasukan ${formatCurrency(item.income)}, pengeluaran ${formatCurrency(item.expense)}`"
                    @mouseenter="hoveredKey = item.key" @mouseleave="hoveredKey = null" @focus="hoveredKey = item.key" @blur="hoveredKey = null" @click="activate(item)">
              <span class="w-[min(24px,30%)] rounded-t-sm bg-[#173B6C]" :style="{ height: barHeight(item.income), minHeight: item.income > 0 ? '2px' : '0' }"></span>
              <span class="w-[min(24px,30%)] rounded-t-sm bg-[#EF4444]" :style="{ height: barHeight(item.expense), minHeight: item.expense > 0 ? '2px' : '0' }"></span>
            </button>
            <div v-if="active" class="pointer-events-none absolute top-0 z-10 w-[210px] -translate-x-1/2 rounded-md border border-[#E2E6EC] bg-white px-3 py-2 text-xs shadow-md" :style="{ left: tooltipPosition }" role="status">
              <p class="font-semibold text-[#172033]">{{ active.labelLong }}</p>
              <p class="mt-1.5 text-[#173B6C]">Pemasukan: <strong>{{ formatCurrency(active.income) }}</strong></p>
              <p class="mt-1 text-[#DC2626]">Pengeluaran: <strong>{{ formatCurrency(active.expense) }}</strong></p>
            </div>
          </div>
        </div>
        <div class="flex pl-[72px] pt-2 text-center text-[11px] text-[#667085]" aria-hidden="true">
          <span v-for="item in data" :key="item.key" class="min-w-0 flex-1">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
