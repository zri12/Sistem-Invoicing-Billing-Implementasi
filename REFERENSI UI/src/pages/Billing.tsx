import { useState } from "react";
import { Search, Receipt } from "lucide-react";
import { formatRupiah, formatDate, getPaymentSummary, type Invoice, type Pembayaran } from "@/data/mock";
import { StatusPembayaranBadge } from "@/components/Badge";
import Pagination from "@/components/Pagination";
import type { Page } from "@/App";

interface Props {
  onNavigate: (page: Page, id?: string) => void;
  invoices: Invoice[];
  payments: Pembayaran[];
}

export default function BillingPage({ onNavigate, invoices, payments }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [page, setPage] = useState(1);

  const billingData = invoices
    .filter(invoice => invoice.statusDokumen === "diterbitkan")
    .map(invoice => {
      const summary = getPaymentSummary(invoice, payments);
      return { ...invoice, sudahDibayar: summary.totalPembayaran, sisaTagihan: summary.sisaTagihan, statusPembayaran: summary.statusPembayaran };
    });

  const filtered = billingData.filter(b => {
    const matchSearch = b.nomorInvoice.toLowerCase().includes(search.toLowerCase()) || b.klienNama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || b.statusPembayaran === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalTagihan = filtered.reduce((s, b) => s + b.total, 0);
  const totalDibayar = filtered.reduce((s, b) => s + b.sudahDibayar, 0);
  const totalSisa = filtered.reduce((s, b) => s + b.sisaTagihan, 0);
  const totalJatuhTempo = filtered.filter(b => b.statusPembayaran === "jatuh_tempo").reduce((s, b) => s + b.sisaTagihan, 0);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Billing</h1>
          <p className="text-sm text-[#667085] mt-0.5">Ringkasan tagihan, pembayaran diterima, dan sisa piutang.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Tagihan", value: formatRupiah(totalTagihan), color: "#173B6C" },
          { label: "Sudah Dibayar", value: formatRupiah(totalDibayar), color: "#16A34A" },
          { label: "Sisa Tagihan", value: formatRupiah(totalSisa), color: "#D97706" },
          { label: "Jatuh Tempo", value: formatRupiah(totalJatuhTempo), color: "#DC2626" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-[#E2E6EC] p-4">
            <div className="text-xs text-[#667085] uppercase tracking-wide mb-2">{s.label}</div>
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari invoice, klien..." className="input search-input w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-44">
          <option value="semua">Semua Status</option>
          <option value="belum_dibayar">Belum Dibayar</option>
          <option value="dibayar_sebagian">Dibayar Sebagian</option>
          <option value="lunas">Lunas</option>
          <option value="jatuh_tempo">Jatuh Tempo</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Klien</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Total Tagihan</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Sudah Dibayar</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Sisa Tagihan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Jatuh Tempo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                  <Receipt size={32} className="opacity-40" />
                  <div className="text-sm">Belum ada data billing</div>
                </div>
              </td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="border-b border-[#F3F4F6] hover:bg-gray-50 cursor-pointer" onClick={() => onNavigate("detail-billing", b.id)}>
                <td className="px-5 py-3.5">
                  <div className="text-sm font-semibold text-[#173B6C]">{b.nomorInvoice}</div>
                  <div className="text-xs text-[#667085]">{b.namaInvoice}</div>
                </td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{b.klienNama}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-[#172033] text-right">{formatRupiah(b.total)}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-green-600 text-right">{formatRupiah(b.sudahDibayar)}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-right" style={{ color: b.sisaTagihan > 0 ? "#D97706" : "#16A34A" }}>{formatRupiah(b.sisaTagihan)}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{formatDate(b.tanggalJatuhTempo)}</td>
                <td className="px-4 py-3.5"><StatusPembayaranBadge status={b.statusPembayaran} /></td>
                <td className="px-4 py-3.5">
                  <button onClick={e => { e.stopPropagation(); onNavigate("detail-billing", b.id); }} className="text-xs text-[#315DA8] hover:underline">Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>
    </div>
  );
}
