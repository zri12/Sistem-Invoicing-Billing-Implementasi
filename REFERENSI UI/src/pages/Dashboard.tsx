import { FileText, TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle, MinusCircle, ArrowRight } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { PENGELUARAN, formatRupiah, formatDate, getPaymentSummary, type Invoice, type Pembayaran, type Pemasukan, type Role } from "@/data/mock";
import { StatusPembayaranBadge } from "@/components/Badge";
import type { Page } from "@/App";

const chartData = [
  { name: "Mar", pemasukan: 4200000, pengeluaran: 1800000 },
  { name: "Apr", pemasukan: 5800000, pengeluaran: 2200000 },
  { name: "Mei", pemasukan: 3900000, pengeluaran: 1500000 },
  { name: "Jun", pemasukan: 7200000, pengeluaran: 3100000 },
  { name: "Jul", pemasukan: 6100000, pengeluaran: 2400000 },
  { name: "Agu", pemasukan: 8350000, pengeluaran: 3300000 },
];

const formatRpShort = (v: number) => {
  if (v >= 1000000) return `Rp ${(v / 1000000).toFixed(1)}jt`;
  if (v >= 1000) return `Rp ${(v / 1000).toFixed(0)}rb`;
  return `Rp ${v}`;
};

interface Props {
  role: Role;
  onNavigate: (page: Page, id?: string) => void;
  invoices: Invoice[];
  payments: Pembayaran[];
  pemasukan: Pemasukan[];
}

export default function Dashboard({ onNavigate, invoices, payments, pemasukan }: Props) {
  const invoiceRows = invoices.map(invoice => ({ ...invoice, ...getPaymentSummary(invoice, payments) }));
  const totalInvoice = invoices.filter(invoice => invoice.statusDokumen !== "dibatalkan").length;
  const sisaTagihan = invoiceRows
    .filter(invoice => invoice.statusDokumen === "diterbitkan")
    .reduce((sum, invoice) => sum + invoice.sisaTagihan, 0);
  const totalPemasukan = pemasukan.reduce((sum, item) => sum + item.nominal, 0);
  const totalPengeluaran = PENGELUARAN.reduce((s, p) => s + p.nominal, 0);

  const statusCounts = {
    belum_dibayar: invoiceRows.filter(invoice => invoice.statusPembayaran === "belum_dibayar" && invoice.statusDokumen !== "dibatalkan").length,
    dibayar_sebagian: invoiceRows.filter(invoice => invoice.statusPembayaran === "dibayar_sebagian" && invoice.statusDokumen !== "dibatalkan").length,
    lunas: invoiceRows.filter(invoice => invoice.statusPembayaran === "lunas" && invoice.statusDokumen !== "dibatalkan").length,
    jatuh_tempo: invoiceRows.filter(invoice => invoice.statusPembayaran === "jatuh_tempo" && invoice.statusDokumen !== "dibatalkan").length,
  };

  const recentInvoices = invoiceRows
    .slice()
    .sort((a, b) => b.tanggalInvoice.localeCompare(a.tanggalInvoice))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-[18px] font-semibold text-[#172033] leading-snug">Dashboard</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-0.5">Ringkasan keuangan dan aktivitas terkini</p>
        </div>
        <select className="h-8 pl-3 pr-8 text-[13px] border border-[#E2E6EC] rounded-md text-[#667085] bg-white focus:outline-none focus:border-[#173B6C]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", appearance: "none" }}>
          <option>Bulan Ini</option>
          <option>3 Bulan Terakhir</option>
          <option>Tahun Ini</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3.5">
        <SummaryCard
          label="Total Invoice"
          value={totalInvoice.toString()}
          sub="invoice aktif"
          icon={<FileText size={15} />}
          onClick={() => onNavigate("invoice")}
          accent="#173B6C"
        />
        <SummaryCard
          label="Sisa Tagihan"
          value={formatRupiah(sisaTagihan)}
          sub="belum terlunasi"
          icon={<AlertCircle size={15} />}
          onClick={() => onNavigate("billing")}
          accent="#D97706"
        />
        <SummaryCard
          label="Total Pemasukan"
          value={formatRupiah(totalPemasukan)}
          sub="bulan ini"
          icon={<TrendingUp size={15} />}
          onClick={() => onNavigate("pemasukan")}
          accent="#16A34A"
        />
        <SummaryCard
          label="Total Pengeluaran"
          value={formatRupiah(totalPengeluaran)}
          sub="bulan ini"
          icon={<TrendingDown size={15} />}
          onClick={() => onNavigate("pengeluaran")}
          accent="#DC2626"
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-3 gap-3.5">
        {/* Invoice status */}
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-4">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[13px] font-semibold text-[#172033]">Status Invoice</h3>
            <button onClick={() => onNavigate("invoice")} className="text-[11px] text-[#315DA8] hover:underline flex items-center gap-0.5">
              Lihat Semua <ArrowRight size={10} />
            </button>
          </div>
          <div className="space-y-2.5">
            <StatusRow label="Belum Dibayar" count={statusCounts.belum_dibayar} color="#94A3B8" icon={<MinusCircle size={13} />} />
            <StatusRow label="Dibayar Sebagian" count={statusCounts.dibayar_sebagian} color="#D97706" icon={<Clock size={13} />} />
            <StatusRow label="Lunas" count={statusCounts.lunas} color="#16A34A" icon={<CheckCircle size={13} />} />
            <StatusRow label="Jatuh Tempo" count={statusCounts.jatuh_tempo} color="#DC2626" icon={<AlertCircle size={13} />} />
          </div>
          <div className="mt-3.5 pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
            <span className="text-[11px] text-[#9CA3AF]">Saldo bersih periode ini</span>
            <span className="text-[13px] font-semibold text-[#172033]">{formatRupiah(totalPemasukan - totalPengeluaran)}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-2 bg-white rounded-lg border border-[#E2E6EC] p-4">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[13px] font-semibold text-[#172033]">Pemasukan vs Pengeluaran</h3>
            <div className="flex items-center gap-4 text-[11px] text-[#9CA3AF]">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#173B6C]" /> Pemasukan</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> Pengeluaran</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={chartData} barSize={14} barGap={3}>
              <CartesianGrid vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#B0BAC7" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatRpShort} tick={{ fontSize: 10, fill: "#B0BAC7" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip
                contentStyle={{ fontSize: 12, border: "1px solid #E2E6EC", borderRadius: 6, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", padding: "6px 10px" }}
                cursor={{ fill: "#F5F7FA" }}
              />
              <Bar dataKey="pemasukan" fill="#173B6C" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-[#E2E6EC]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E6EC]">
          <h3 className="text-[13px] font-semibold text-[#172033]">Invoice Terbaru</h3>
          <button onClick={() => onNavigate("invoice")} className="text-[11px] text-[#315DA8] hover:underline flex items-center gap-0.5">
            Lihat Semua <ArrowRight size={10} />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F3F4F6]">
              <th className="text-left px-5 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">Nomor Invoice</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">Klien</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">Jatuh Tempo</th>
              <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">Total</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map((inv) => (
              <tr key={inv.id} className="border-b border-[#F9FAFB] hover:bg-[#FAFBFC] cursor-pointer transition-colors" onClick={() => onNavigate("detail-invoice", inv.id)}>
                <td className="px-5 py-3 text-[13px] font-semibold text-[#173B6C]">{inv.nomorInvoice}</td>
                <td className="px-4 py-3 text-[13px] text-[#172033]">{inv.klienNama}</td>
                <td className="px-4 py-3 text-[13px] text-[#9CA3AF]">{formatDate(inv.tanggalJatuhTempo)}</td>
                <td className="px-4 py-3 text-[13px] text-[#172033] text-right font-medium tabular-nums">{formatRupiah(inv.total)}</td>
                <td className="px-4 py-3"><StatusPembayaranBadge status={inv.statusPembayaran} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, icon, onClick, accent }: {
  label: string; value: string; sub: string; icon: React.ReactNode; onClick: () => void; accent: string;
}) {
  return (
    <button onClick={onClick} className="bg-white rounded-lg border border-[#E2E6EC] px-4 py-4 text-left hover:border-[#D0D8E4] transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">{label}</span>
        <div className="flex items-center justify-center" style={{ color: accent + "CC" }}>
          {icon}
        </div>
      </div>
      <div className="text-[20px] font-bold text-[#172033] leading-tight tabular-nums">{value}</div>
      <div className="text-[11px] text-[#B0BAC7] mt-1">{sub}</div>
    </button>
  );
}

function StatusRow({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 min-w-0">
        <span style={{ color }} className="flex-shrink-0">{icon}</span>
        <span className="text-[13px] text-[#4B5563] truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-20 h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min((count / 5) * 100, 100)}%`, background: color, opacity: 0.8 }} />
        </div>
        <span className="text-[13px] font-semibold text-[#172033] w-4 text-right">{count}</span>
      </div>
    </div>
  );
}
