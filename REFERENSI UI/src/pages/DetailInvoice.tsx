import { useState } from "react";
import { ChevronLeft, Printer, Eye, Edit, CreditCard, CheckCircle } from "lucide-react";
import { formatRupiah, formatDate, formatDateLong, getPaymentSummary, type Invoice, type Pembayaran, type Pemasukan } from "@/data/mock";
import { StatusDokumenBadge, StatusPembayaranBadge } from "@/components/Badge";
import PaymentModal from "@/components/PaymentModal";
import type { Page } from "@/App";

interface Props {
  invoiceId: string;
  isReadOnly: boolean;
  onNavigate: (page: Page, id?: string) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  invoices: Invoice[];
  payments: Pembayaran[];
  onAddPayment: (payment: Pembayaran, pemasukan: Pemasukan) => void;
  onPrintInvoice: (invoiceId: string) => void;
}

export default function DetailInvoice({ invoiceId, isReadOnly, onNavigate, invoices, payments, onAddPayment, onPrintInvoice }: Props) {
  const inv = invoices.find(i => i.id === invoiceId) ?? invoices[0];
  const [payModalOpen, setPayModalOpen] = useState(false);

  const allPayments = payments.filter(payment => payment.invoiceId === inv.id);
  const { totalPembayaran, sisaTagihan, statusPembayaran } = getPaymentSummary(inv, payments);

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate("invoice")} className="p-1.5 rounded hover:bg-gray-200 text-[#667085]">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#172033]">{inv.nomorInvoice}</h1>
            <StatusDokumenBadge status={inv.statusDokumen} />
            <StatusPembayaranBadge status={statusPembayaran} />
          </div>
          <p className="text-sm text-[#667085] mt-0.5">{inv.namaInvoice}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate("preview-invoice", inv.id)} className="btn-secondary flex items-center gap-2">
            <Eye size={14} /> Preview
          </button>
          <button onClick={() => onPrintInvoice(inv.id)} className="btn-secondary flex items-center gap-2">
            <Printer size={14} /> Cetak PDF
          </button>
          {!isReadOnly && inv.statusDokumen !== "dibatalkan" && (
            <button onClick={() => onNavigate("buat-invoice", inv.id)} className="btn-secondary flex items-center gap-2">
              <Edit size={14} /> Edit
            </button>
          )}
          {!isReadOnly && sisaTagihan > 0 && inv.statusDokumen === "diterbitkan" && (
            <button onClick={() => setPayModalOpen(true)} className="btn-primary flex items-center gap-2">
              <CreditCard size={14} /> Catat Pembayaran
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Klien */}
          <section className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Informasi Klien</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#667085] text-xs mb-1">Nama Klien / Perusahaan</div>
                <div className="font-medium text-[#172033]">{inv.klienNama}</div>
              </div>
              <div>
                <div className="text-[#667085] text-xs mb-1">Tanggal Invoice</div>
                <div className="text-[#172033]">{formatDateLong(inv.tanggalInvoice)}</div>
              </div>
              <div>
                <div className="text-[#667085] text-xs mb-1">Jatuh Tempo</div>
                <div className="text-[#172033]">{formatDateLong(inv.tanggalJatuhTempo)}</div>
              </div>
            </div>
          </section>

          {/* Rincian */}
          <section className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Rincian Invoice</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E6EC]">
                  <th className="text-left pb-2 text-xs font-medium text-[#667085]">Deskripsi</th>
                  <th className="text-right pb-2 text-xs font-medium text-[#667085]">Harga</th>
                  <th className="text-center pb-2 text-xs font-medium text-[#667085]">Qty</th>
                  <th className="text-right pb-2 text-xs font-medium text-[#667085]">Total</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map(item => (
                  <tr key={item.id} className="border-b border-[#F3F4F6]">
                    <td className="py-3 text-sm">
                      <div className="font-medium text-[#172033]">{item.produkLayanan}</div>
                      <div className="text-xs text-[#667085]">{item.deskripsi}</div>
                    </td>
                    <td className="py-3 text-sm text-right text-[#667085]">{formatRupiah(item.harga)}</td>
                    <td className="py-3 text-sm text-center text-[#667085]">{item.qty}</td>
                    <td className="py-3 text-sm text-right font-medium text-[#172033]">{formatRupiah(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-3 border-t border-[#E2E6EC] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#667085]">Subtotal</span>
                <span>{formatRupiah(inv.subtotal)}</span>
              </div>
              {inv.diskon > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#667085]">Diskon</span>
                  <span className="text-red-600">-{formatRupiah(inv.diskon)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-[#E2E6EC] pt-2">
                <span>Total Due</span>
                <span className="text-[#173B6C]">{formatRupiah(inv.total)}</span>
              </div>
            </div>
          </section>

          {/* Riwayat Pembayaran */}
          <section className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Riwayat Pembayaran</h3>
            {allPayments.length === 0 ? (
              <div className="text-sm text-[#9CA3AF] py-4 text-center">Belum ada pembayaran tercatat</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E6EC]">
                    <th className="text-left pb-2 text-xs font-medium text-[#667085]">Tanggal</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#667085]">Metode</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#667085]">Rekening</th>
                    <th className="text-left pb-2 text-xs font-medium text-[#667085]">Referensi</th>
                    <th className="text-right pb-2 text-xs font-medium text-[#667085]">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map(p => (
                    <tr key={p.id} className="border-b border-[#F3F4F6]">
                      <td className="py-2.5 text-sm text-[#667085]">{formatDate(p.tanggal)}</td>
                      <td className="py-2.5 text-sm text-[#667085]">{p.metode}</td>
                      <td className="py-2.5 text-sm text-[#667085]">{p.rekeningNama}</td>
                      <td className="py-2.5 text-sm text-[#667085] font-mono text-xs">{p.referensi || "-"}</td>
                      <td className="py-2.5 text-sm font-semibold text-[#172033] text-right">{formatRupiah(p.nominal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        {/* Billing summary sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">Ringkasan Billing</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#667085]">Total Invoice</span>
                <span className="font-medium text-[#172033]">{formatRupiah(inv.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#667085]">Total Pembayaran</span>
                <span className="font-medium text-green-600">{formatRupiah(totalPembayaran)}</span>
              </div>
              <div className="border-t border-[#E2E6EC] pt-3 flex justify-between">
                <span className="text-sm font-semibold text-[#172033]">Sisa Tagihan</span>
                <span className={`text-base font-bold ${sisaTagihan === 0 ? "text-green-600" : "text-[#D97706]"}`}>{formatRupiah(sisaTagihan)}</span>
              </div>
            </div>
            {sisaTagihan === 0 && (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-xs bg-green-50 rounded p-2">
                <CheckCircle size={13} /> Lunas
              </div>
            )}
          </div>
          {inv.catatanPembayaran && (
            <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
              <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Metode Pembayaran</h3>
              <p className="text-sm text-[#172033] whitespace-pre-line">{inv.catatanPembayaran}</p>
            </div>
          )}
        </div>
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
