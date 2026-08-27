import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import type { Role } from "@/data/mock";
import type { Page } from "@/App";

const pageTitles: Partial<Record<Page, string>> = {
  dashboard: "Dashboard",
  klien: "Klien",
  vendor: "Vendor",
  produk: "Produk & Layanan",
  rekening: "Rekening",
  invoice: "Invoice",
  "buat-invoice": "Buat Invoice",
  "detail-invoice": "Detail Invoice",
  "preview-invoice": "Preview Invoice",
  billing: "Billing",
  "detail-billing": "Detail Billing",
  pembayaran: "Pembayaran",
  pemasukan: "Pemasukan",
  pengeluaran: "Pengeluaran",
  laporan: "Laporan",
  "data-perusahaan": "Data Perusahaan",
  "template-invoice": "Template Invoice",
  "penomoran-invoice": "Penomoran Invoice",
  pengguna: "Pengguna & Hak Akses",
};

interface Props {
  userName: string;
  role: Role;
  onLogout: () => void;
  currentPage: Page;
  onMenuClick: () => void;
}

export default function Topbar({ currentPage, onMenuClick }: Props) {
  const title = pageTitles[currentPage] ?? "";
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-[52px] bg-white border-b border-[#E2E6EC] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center min-w-0 gap-2">
        <button onClick={onMenuClick} aria-label="Buka navigasi" className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-[#667085] hover:bg-[#F5F7FA]">
          <Menu size={18} />
        </button>
        <span className="text-xs font-medium text-[#A0AABB] tracking-wide select-none truncate">{title}</span>
      </div>
      <div className="relative flex items-center">
        <button onClick={() => setShowNotifications(value => !value)} aria-label="Buka notifikasi" className="w-8 h-8 flex items-center justify-center rounded-md text-[#A0AABB] hover:bg-[#F5F7FA] hover:text-[#667085] transition-colors">
          <Bell size={15} />
        </button>
        {showNotifications && (
          <div className="absolute right-0 top-10 z-30 w-72 rounded-lg border border-[#E2E6EC] bg-white p-3 shadow-lg">
            <div className="text-sm font-semibold text-[#172033]">Notifikasi</div>
            <p className="mt-2 text-xs leading-relaxed text-[#667085]">Tidak ada notifikasi baru. Pembaruan transaksi akan tampil di sini.</p>
          </div>
        )}
      </div>
    </header>
  );
}
