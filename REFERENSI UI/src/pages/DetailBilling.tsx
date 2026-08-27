import { useState } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { formatRupiah, formatDate, getPaymentSummary, type Invoice, type Pembayaran, type Pemasukan } from "@/data/mock";
import { StatusPembayaranBadge } from "@/components/Badge";
import PaymentModal from "@/components/PaymentModal";
import type { Page } from "@/App";

interface Props {
  billingId: string;
  isReadOnly: boolean;
  onNavigate: (page: Page, id?: string) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  invoices: Invoice[];
  payments: Pembayaran[];
  onAddPayment: (payment: Pembayaran, pemasukan: Pemasukan) => void;
}

export default function DetailBilling({ billingId, isReadOnly, onNavigate, invoices, payments, onAddPayment }: Props) {
  const inv = invoices.find(i => i.id === billingId) ?? invoices[0];
  const [payModalOpen, setPayModalOpen] = useState(false);

  const allPayments = payments.filter(payment => payment.invoiceId === inv.id);
  const { totalPembayaran, sisaTagihan, statusPembayaran } = getPaymentSummary(inv, payments);

  return (
    <div className="p-6 w-full">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => onNavigate("billing")} className="p-1.5 rounded hover:bg-gray-200 text-[#667085]">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#172033]">{inv.nomorInvoice}</h1>
            <StatusPembayaranBadge status={statusPembayaran} />
          </div>
          <p className="text-sm text-[#667085]">{inv.klienNama} — {inv.namaInvoice}</p>
        </div>
        {!isReadOnly && sisaTagihan > 0 && inv.statusDokumen === "diterbitkan" && (
          <button onClick={() => setPayModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> Catat Pembayaran
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Invoice", value: formatRupiah(inv.total), color: "#172033" },
          { label: "Sudah Dibayar", value: formatRupiah(totalPembayaran), color: "#16A34A" },
          { label: "Sisa Tagihan", value: formatRupiah(sisaTagihan), color: sisaTagihan > 0 ? "#D97706" : "#16A34A" },
          { label: "Jatuh Tempo", value: formatDate(inv.tanggalJatuhTempo), color: statusPembayaran === "jatuh_tempo" ? "#DC2626" : "#667085" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-[#E2E6EC] p-4">
            <div className="text-xs text-[#667085] mb-2">{s.label}</div>
            <div className="text-base font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Riwayat Pembayaran */}
      <div className="bg-white rounded-lg border border-[#E2E6EC]">
        <div className="px-5 py-4 border-b border-[#E2E6EC]">
          <h3 className="text-sm font-semibold text-[#172033]">Riwayat Pembayaran</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Metode</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Rekening</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Nomor Referensi</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {allPayments.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#9CA3AF]">Belum ada pembayaran tercatat</td></tr>
            ) : allPayments.map(p => (
              <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-[#667085]">{formatDate(p.tanggal)}</td>
                <td className="px-4 py-3 text-sm text-[#667085]">{p.metode}</td>
                <td className="px-4 py-3 text-sm text-[#667085]">{p.rekeningNama}</td>
                <td className="px-4 py-3 text-sm text-[#667085] font-mono text-xs">{p.referensi || "-"}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#172033] text-right">{formatRupiah(p.nominal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {allPayments.length > 0 && (
          <div className="px-5 py-3 border-t border-[#E2E6EC] flex justify-between items-center">
            <span className="text-xs text-[#667085]">Total pembayaran</span>
            <span className="text-sm font-bold text-green-600">{formatRupiah(totalPembayaran)}</span>
          </div>
        )}
      </div>

      <PaymentModal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        invoice={inv}
        totalAlreadyPaid={totalPembayaran}
        onSave={onAddPayment}
      />
    </div>
  );
}
