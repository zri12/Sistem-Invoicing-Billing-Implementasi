import { useState } from "react";
import { Search, Plus, MoreHorizontal, FileText, Filter } from "lucide-react";
import { formatRupiah, formatDate, getPaymentSummary, type Invoice, type Pembayaran, type Pemasukan } from "@/data/mock";
import { StatusDokumenBadge, StatusPembayaranBadge } from "@/components/Badge";
import Pagination from "@/components/Pagination";
import PaymentModal from "@/components/PaymentModal";
import type { Page } from "@/App";

interface Props {
  isReadOnly: boolean;
  onNavigate: (page: Page, id?: string) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  invoices: Invoice[];
  payments: Pembayaran[];
  onAddPayment: (payment: Pembayaran, pemasukan: Pemasukan) => void;
}

export default function InvoiceList({ isReadOnly, onNavigate, invoices, payments, onAddPayment }: Props) {
  const [search, setSearch] = useState("");
  const [statusDok, setStatusDok] = useState("semua");
  const [statusBayar, setStatusBayar] = useState("semua");
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const invoiceRows = invoices.map(invoice => ({ ...invoice, ...getPaymentSummary(invoice, payments) }));
  const filtered = invoiceRows.filter(inv => {
    const matchSearch = inv.nomorInvoice.toLowerCase().includes(search.toLowerCase()) ||
      inv.namaInvoice.toLowerCase().includes(search.toLowerCase()) ||
      inv.klienNama.toLowerCase().includes(search.toLowerCase());
    const matchDok = statusDok === "semua" || inv.statusDokumen === statusDok;
    const matchBayar = statusBayar === "semua" || inv.statusPembayaran === statusBayar;
    return matchSearch && matchDok && matchBayar;
  });

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Invoice</h1>
          <p className="text-sm text-[#667085] mt-0.5">Kelola semua invoice dan tagihan kepada klien.</p>
        </div>
        {!isReadOnly && (
          <button onClick={() => onNavigate("buat-invoice")} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Buat Invoice
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nomor, nama, klien..." className="input search-input w-full" />
        </div>
        <select value={statusDok} onChange={e => setStatusDok(e.target.value)} className="input w-40">
          <option value="semua">Status Dokumen</option>
          <option value="draft">Draft</option>
          <option value="diterbitkan">Diterbitkan</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
        <select value={statusBayar} onChange={e => setStatusBayar(e.target.value)} className="input w-44">
          <option value="semua">Status Pembayaran</option>
          <option value="belum_dibayar">Belum Dibayar</option>
          <option value="dibayar_sebagian">Dibayar Sebagian</option>
          <option value="lunas">Lunas</option>
          <option value="jatuh_tempo">Jatuh Tempo</option>
        </select>
        {(search || statusDok !== "semua" || statusBayar !== "semua") && (
          <button onClick={() => { setSearch(""); setStatusDok("semua"); setStatusBayar("semua"); }} className="btn-secondary text-xs">Reset Filter</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Nomor Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Nama Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Klien</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Jatuh Tempo</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Total</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Dokumen</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Pembayaran</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                  <FileText size={32} className="opacity-40" />
                  <div className="text-sm font-medium text-[#667085]">Belum ada invoice</div>
                  <div className="text-xs">Invoice yang dibuat akan tampil di halaman ini.</div>
                  {!isReadOnly && (
                    <button onClick={() => onNavigate("buat-invoice")} className="btn-primary mt-2 text-xs">+ Buat Invoice</button>
                  )}
                </div>
              </td></tr>
            ) : filtered.map((inv, index) => (
              <tr key={inv.id} className="border-b border-[#F3F4F6] hover:bg-gray-50 cursor-pointer" onClick={() => onNavigate("detail-invoice", inv.id)}>
                <td className="px-5 py-3.5 text-sm font-semibold text-[#173B6C]">{inv.nomorInvoice}</td>
                <td className="px-4 py-3.5 text-sm text-[#172033]">{inv.namaInvoice}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085] max-w-[160px] truncate">{inv.klienNama}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{formatDate(inv.tanggalInvoice)}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{formatDate(inv.tanggalJatuhTempo)}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-[#172033] text-right">{formatRupiah(inv.total)}</td>
                <td className="px-4 py-3.5"><StatusDokumenBadge status={inv.statusDokumen} /></td>
                <td className="px-4 py-3.5"><StatusPembayaranBadge status={inv.statusPembayaran} /></td>
                <td className="px-4 py-3.5 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === inv.id ? null : inv.id)} className="p-1.5 rounded hover:bg-gray-100 text-[#667085]">
                    <MoreHorizontal size={15} />
                  </button>
                  {menuOpen === inv.id && (
                    <div className={`absolute right-4 ${index >= filtered.length - 3 ? "bottom-10" : "top-10"} z-20 bg-white rounded-lg shadow-lg border border-[#E2E6EC] py-1 w-44`}>
                      <button onClick={() => { setMenuOpen(null); onNavigate("detail-invoice", inv.id); }} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Detail</button>
                      <button onClick={() => { setMenuOpen(null); onNavigate("preview-invoice", inv.id); }} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Preview PDF</button>
                      {!isReadOnly && inv.statusDokumen !== "dibatalkan" && (
                        <button onClick={() => { setMenuOpen(null); onNavigate("buat-invoice", inv.id); }} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Edit</button>
                      )}
                      {!isReadOnly && inv.statusPembayaran !== "lunas" && inv.statusDokumen === "diterbitkan" && (
                        <button onClick={() => { setMenuOpen(null); setPaymentInvoice(inv); }} className="w-full text-left px-4 py-2 text-sm text-[#173B6C] hover:bg-gray-50 font-medium">Catat Pembayaran</button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>
      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
      {paymentInvoice && (
        <PaymentModal
          open={Boolean(paymentInvoice)}
          onClose={() => setPaymentInvoice(null)}
          invoice={paymentInvoice}
          totalAlreadyPaid={getPaymentSummary(paymentInvoice, payments).totalPembayaran}
          onSave={onAddPayment}
        />
      )}
    </div>
  );
}
