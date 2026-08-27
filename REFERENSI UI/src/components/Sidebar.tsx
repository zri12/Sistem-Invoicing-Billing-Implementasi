import {
  LayoutDashboard, Users, Building2, Package, CreditCard,
  FileText, Receipt, Wallet, TrendingUp, TrendingDown,
  BarChart3, Settings, Building, FileEdit, Hash, UserCog,
  LogOut, ChevronDown
} from "lucide-react";
import DevspaceLogo from "./DevspaceLogo";
import type { Role } from "@/data/mock";
import type { Page } from "@/App";
import { useState } from "react";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminNav: NavGroup[] = [
  {
    label: "Dashboard",
    items: [{ id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> }],
  },
  {
    label: "Master Data",
    items: [
      { id: "klien", label: "Klien", icon: <Users size={16} /> },
      { id: "vendor", label: "Vendor", icon: <Building2 size={16} /> },
      { id: "produk", label: "Produk & Layanan", icon: <Package size={16} /> },
      { id: "rekening", label: "Rekening", icon: <CreditCard size={16} /> },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { id: "invoice", label: "Invoice", icon: <FileText size={16} /> },
      { id: "billing", label: "Billing", icon: <Receipt size={16} /> },
      { id: "pembayaran", label: "Pembayaran", icon: <Wallet size={16} /> },
      { id: "pemasukan", label: "Pemasukan", icon: <TrendingUp size={16} /> },
      { id: "pengeluaran", label: "Pengeluaran", icon: <TrendingDown size={16} /> },
    ],
  },
  {
    label: "Laporan",
    items: [{ id: "laporan", label: "Laporan", icon: <BarChart3 size={16} /> }],
  },
  {
    label: "Pengaturan",
    items: [
      { id: "data-perusahaan", label: "Data Perusahaan", icon: <Building size={16} /> },
      { id: "template-invoice", label: "Template Invoice", icon: <FileEdit size={16} /> },
      { id: "penomoran-invoice", label: "Penomoran Invoice", icon: <Hash size={16} /> },
      { id: "pengguna", label: "Pengguna & Hak Akses", icon: <UserCog size={16} /> },
    ],
  },
];

const managerNav: NavGroup[] = [
  {
    label: "Dashboard",
    items: [{ id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> }],
  },
  {
    label: "Data",
    items: [
      { id: "klien", label: "Klien", icon: <Users size={16} /> },
      { id: "vendor", label: "Vendor", icon: <Building2 size={16} /> },
      { id: "produk", label: "Produk & Layanan", icon: <Package size={16} /> },
      { id: "rekening", label: "Rekening", icon: <CreditCard size={16} /> },
      { id: "data-perusahaan", label: "Data Perusahaan", icon: <Building size={16} /> },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { id: "invoice", label: "Invoice", icon: <FileText size={16} /> },
      { id: "billing", label: "Billing", icon: <Receipt size={16} /> },
      { id: "pembayaran", label: "Pembayaran", icon: <Wallet size={16} /> },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { id: "pemasukan", label: "Pemasukan", icon: <TrendingUp size={16} /> },
      { id: "pengeluaran", label: "Pengeluaran", icon: <TrendingDown size={16} /> },
    ],
  },
  {
    label: "Laporan",
    items: [{ id: "laporan", label: "Laporan", icon: <BarChart3 size={16} /> }],
  },
];

interface Props {
  role: Role;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userName: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, currentPage, onNavigate, userName, onLogout, isOpen, onClose }: Props) {
  const nav = role === "admin" ? adminNav : managerNav;
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = userName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      {isOpen && <button aria-label="Tutup navigasi" onClick={onClose} className="fixed inset-0 z-30 bg-black/35 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[236px] bg-white border-r border-[#E2E6EC] flex flex-col h-full transform transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:flex-shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Logo — exactly h-[52px] to align with topbar */}
      <div className="h-[52px] flex-shrink-0 flex items-center gap-2.5 px-5 border-b border-[#E2E6EC]">
        <DevspaceLogo size={26} withText={false} />
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-[#172033] leading-none tracking-tight">DEVSPACE</div>
          <div className="text-[10px] text-[#9CA3AF] mt-0.5 leading-none font-medium tracking-wide">Invoicing & Billing</div>
        </div>
      </div>

      {/* Navigation — scrollbar hidden via .sidebar-nav */}
      <nav className="sidebar-nav flex-1 overflow-y-auto py-2.5 px-3">
        {nav.map((group) => (
          <div key={group.label} className="mb-0.5">
            <div className="px-2 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: "#8B96A5" }}>{group.label}</div>
            {group.items.map((item) => {
              const isActive = currentPage === item.id ||
                (item.id === "invoice" && ["invoice", "buat-invoice", "detail-invoice", "preview-invoice"].includes(currentPage)) ||
                (item.id === "billing" && ["billing", "detail-billing"].includes(currentPage));
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] transition-colors mb-px ${
                    isActive
                      ? "bg-[#EEF2F8] text-[#173B6C] font-medium"
                      : "text-[#5E6E82] hover:bg-[#F5F7FA] hover:text-[#172033]"
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? "text-[#173B6C]" : "text-[#A0AABB]"}`}>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <div className="w-1 h-3.5 rounded-full bg-[#173B6C] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-[#E2E6EC] px-3 py-2.5 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-[#F5F7FA] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#173B6C] text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[13px] font-medium text-[#172033] truncate leading-snug">{userName}</div>
            <div className="text-[10px] text-[#9CA3AF] leading-snug">{role === "admin" ? "Admin / Finance" : "Pimpinan"}</div>
          </div>
          <ChevronDown size={13} className="text-[#B0BAC7] flex-shrink-0" />
        </button>

        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-lg shadow-lg border border-[#E2E6EC] py-1 z-10">
            <button
              onClick={() => { setShowUserMenu(false); onClose(); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>
        )}
      </div>
      </aside>
    </>
  );
}
