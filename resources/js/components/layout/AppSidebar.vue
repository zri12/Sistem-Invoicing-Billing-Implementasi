<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BarChart3, Building, Building2, ChevronDown, FileEdit, FileText, Hash, LayoutDashboard, LogOut, Package, PanelLeftClose, Receipt, TrendingDown, TrendingUp, UserCog, Users, Wallet, CreditCard, X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import DevspaceLogo from './DevspaceLogo.vue';
import SidebarNavItem from './SidebarNavItem.vue';
import SidebarSection from './SidebarSection.vue';

const ui = useUiStore(); const auth = useAuthStore(); const route = useRoute(); const router = useRouter(); const showUserMenu = ref(false);
const isCollapsed = computed(() => ui.sidebarCollapsed); const userName = computed(() => auth.user?.name || 'Fazri Lukman'); const roleLabel = computed(() => auth.role === 'manager' ? 'Pimpinan / Manager' : 'Admin / Finance'); const initials = computed(() => userName.value.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase());
const adminGroups = [
    { label: 'Dashboard', items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
    { label: 'Master Data', items: [{ label: 'Klien', to: '/klien', icon: Users }, { label: 'Vendor', to: '/vendor', icon: Building2 }, { label: 'Produk & Layanan', to: '/produk-layanan', icon: Package }, { label: 'Rekening', to: '/rekening', icon: CreditCard }] },
    { label: 'Transaksi', items: [{ label: 'Invoice', to: '/invoice', icon: FileText }, { label: 'Billing', to: '/billing', icon: Receipt }, { label: 'Pembayaran', to: '/pembayaran', icon: Wallet }, { label: 'Pemasukan', to: '/pemasukan', icon: TrendingUp }, { label: 'Pengeluaran', to: '/pengeluaran', icon: TrendingDown }] },
    { label: 'Laporan', items: [{ label: 'Laporan', to: '/laporan', icon: BarChart3 }] },
    { label: 'Pengaturan', items: [{ label: 'Data Perusahaan', to: '/data-perusahaan', icon: Building }, { label: 'Template Invoice', to: '/template-invoice', icon: FileEdit }, { label: 'Penomoran Invoice', to: '/penomoran-invoice', icon: Hash }, { label: 'Pengguna & Hak Akses', to: '/pengguna', icon: UserCog }] },
];
const managerGroups = [
    { label: 'Dashboard', items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
    { label: 'Data', items: [{ label: 'Klien', to: '/klien', icon: Users }, { label: 'Vendor', to: '/vendor', icon: Building2 }, { label: 'Produk & Layanan', to: '/produk-layanan', icon: Package }, { label: 'Rekening', to: '/rekening', icon: CreditCard }, { label: 'Data Perusahaan', to: '/data-perusahaan', icon: Building }] },
    { label: 'Monitoring', items: [{ label: 'Invoice', to: '/invoice', icon: FileText }, { label: 'Billing', to: '/billing', icon: Receipt }, { label: 'Pembayaran', to: '/pembayaran', icon: Wallet }] },
    { label: 'Keuangan', items: [{ label: 'Pemasukan', to: '/pemasukan', icon: TrendingUp }, { label: 'Pengeluaran', to: '/pengeluaran', icon: TrendingDown }] },
    { label: 'Laporan', items: [{ label: 'Laporan', to: '/laporan', icon: BarChart3 }] },
];
const groups = computed(() => auth.role === 'manager' ? managerGroups : adminGroups);
const active = (item) => route.path === item.to || (['/invoice', '/billing'].includes(item.to) && route.path.startsWith(item.to));
const closeMobile = () => ui.closeMobileSidebar();
const logout = () => { auth.logoutDemo(); closeMobile(); router.replace({ name: 'login' }); };
</script>

<template>
  <button v-if="ui.mobileSidebarOpen" aria-label="Tutup navigasi" class="fixed inset-0 z-30 bg-black/35 lg:hidden" @click="closeMobile" />
  <aside :class="['fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-[#E2E6EC] bg-white transition-[width,transform] duration-200 lg:static lg:z-auto lg:translate-x-0 lg:shrink-0', isCollapsed ? 'w-[76px]' : 'w-[236px]', ui.mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full']">
    <div :class="['flex h-[52px] shrink-0 items-center border-b border-[#E2E6EC]', isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-5']">
      <DevspaceLogo v-if="!isCollapsed" :size="26" />
      <button v-else class="hidden rounded p-1 lg:inline-flex" title="Perluas sidebar" aria-label="Perluas sidebar" @click="ui.toggleSidebar"><DevspaceLogo :size="26" /></button>
      <DevspaceLogo v-if="isCollapsed" :size="26" class="lg:hidden" />
      <div v-if="!isCollapsed" class="min-w-0 flex-1"><div class="text-[13px] font-bold leading-none tracking-tight text-[#172033]">DEVSPACE</div><div class="mt-0.5 text-[10px] font-medium leading-none tracking-wide text-[#9CA3AF]">Invoicing &amp; Billing</div></div>
      <button v-if="!isCollapsed" class="hidden rounded p-1 text-[#A0AABB] hover:bg-[#F5F7FA] hover:text-[#667085] lg:inline-flex" aria-label="Ciutkan sidebar" @click="ui.toggleSidebar"><PanelLeftClose :size="16" /></button>
      <button class="rounded p-1 text-[#A0AABB] hover:bg-[#F5F7FA] lg:hidden" aria-label="Tutup navigasi" @click="closeMobile"><X :size="16" /></button>
    </div>
    <nav class="sidebar-nav flex-1 overflow-y-auto px-3 py-2.5" :class="isCollapsed && 'px-2'"><SidebarSection v-for="group in groups" :key="group.label" :label="group.label" :collapsed="isCollapsed"><SidebarNavItem v-for="item in group.items" :key="item.to" :item="item" :active="active(item)" :collapsed="isCollapsed" @navigate="closeMobile" /></SidebarSection></nav>
    <div class="relative border-t border-[#E2E6EC] py-2.5" :class="isCollapsed ? 'px-2' : 'px-3'"><button :title="isCollapsed ? `${userName} — ${roleLabel}` : undefined" :class="['flex w-full items-center rounded-md py-2 transition-colors hover:bg-[#F5F7FA]', isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2']" @click="showUserMenu = !showUserMenu"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173B6C] text-[11px] font-semibold text-white">{{ initials }}</span><span v-if="!isCollapsed" class="min-w-0 flex-1 text-left"><span class="block truncate text-[13px] font-medium leading-snug text-[#172033]">{{ userName }}</span><span class="block text-[10px] leading-snug text-[#9CA3AF]">{{ roleLabel }}</span></span><ChevronDown v-if="!isCollapsed" :size="13" class="shrink-0 text-[#B0BAC7]" /></button><div v-if="showUserMenu" :class="['absolute bottom-full mb-1 rounded-lg border border-[#E2E6EC] bg-white py-1 shadow-lg', isCollapsed ? 'left-2 w-48' : 'left-3 right-3']"><button class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50" @click="logout"><LogOut :size="14" />Keluar</button></div></div>
  </aside>
</template>
