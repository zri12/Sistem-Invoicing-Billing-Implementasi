import { useState } from "react";
import { Printer, Download } from "lucide-react";
import { PENGELUARAN, formatRupiah, formatDate, getPaymentSummary, type Invoice, type Pembayaran, type Pemasukan } from "@/data/mock";

type Tab = "debit-kredit" | "invoice" | "pembayaran" | "pemasukan" | "pengeluaran";

interface Props {
  invoices: Invoice[];
  payments: Pembayaran[];
  pemasukan: Pemasukan[];
}

export default function LaporanPage({ invoices, payments, pemasukan }: Props) {
  const [tab, setTab] = useState<Tab>("debit-kredit");
  const [dateFrom, setDateFrom] = useState("2026-07-01");
  const [dateTo, setDateTo] = useState("2026-08-31");
  const [rekeningFilter, setRekeningFilter] = useState("semua");
  const [filterApplied, setFilterApplied] = useState(false);

  const allPemasukan = pemasukan;
  const allPembayaran = payments;

  const applyDateFilter = <T extends { tanggal: string }>(rows: T[]) => {
    if (!filterApplied) return rows;
    return rows.filter(r => r.tanggal >= dateFrom && r.tanggal <= dateTo);
  };

  const applyRekeningFilter = <T extends { rekeningId?: string }>(rows: T[]) => {
    if (rekeningFilter === "semua") return rows;
    return rows.filter(r => (r as any).rekeningId === rekeningFilter);
  };

  const filteredPemasukan = applyRekeningFilter(applyDateFilter(allPemasukan));
  const filteredPengeluaran = applyRekeningFilter(applyDateFilter(PENGELUARAN));
  const filteredPembayaran = applyDateFilter(allPembayaran);

  // Debit kredit data
  const saldoAwal = 122000000;
  const totalDebit = filteredPemasukan.reduce((s, p) => s + p.nominal, 0);
  const totalKredit = filteredPengeluaran.reduce((s, p) => s + p.nominal, 0);
  const saldoAkhir = saldoAwal + totalDebit - totalKredit;

  const laporanRows = [
    ...filteredPemasukan.map(p => ({ tanggal: p.tanggal, referensi: p.referensiInvoice || "-", keterangan: p.keterangan, debit: p.nominal, kredit: 0 })),
    ...filteredPengeluaran.map(p => ({ tanggal: p.tanggal, referensi: "-", keterangan: p.keterangan, debit: 0, kredit: p.nominal })),
  ].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  let runningBalance = saldoAwal;

  const tabs: { id: Tab; label: string }[] = [
    { id: "debit-kredit", label: "Keuangan / Debit & Kredit" },
    { id: "invoice", label: "Invoice" },
    { id: "pembayaran", label: "Pembayaran" },
    { id: "pemasukan", label: "Pemasukan" },
    { id: "pengeluaran", label: "Pengeluaran" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Laporan</h1>
          <p className="text-sm text-[#667085] mt-0.5">Laporan keuangan dan transaksi perusahaan.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2"><Printer size={14} /> Cetak</button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2"><Download size={14} /> Simpan PDF</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2E6EC] mb-5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[#173B6C] text-[#173B6C]" : "border-transparent text-[#667085] hover:text-[#172033]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 bg-white rounded-lg border border-[#E2E6EC] p-4">
        <div>
          <label className="block text-xs text-[#667085] mb-1">Tanggal Awal</label>
          <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[#667085] mb-1">Tanggal Akhir</label>
          <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[#667085] mb-1">Rekening</label>
          <select className="input w-36" value={rekeningFilter} onChange={e => setRekeningFilter(e.target.value)}>
            <option value="semua">Semua</option>
            <option value="r1">BCA</option>
            <option value="r2">Mandiri</option>
            <option value="r3">Kas Kantor</option>
          </select>
        </div>
        <div className="flex items-end gap-2 pt-5">
          <button onClick={() => setFilterApplied(true)} className="btn-primary">Terapkan</button>
          <button onClick={() => { setFilterApplied(false); setDateFrom("2026-07-01"); setDateTo("2026-08-31"); setRekeningFilter("semua"); }} className="btn-secondary">Reset</button>
        </div>
      </div>

      {tab === "debit-kredit" && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: "Saldo Awal", value: formatRupiah(saldoAwal), color: "#173B6C" },
              { label: "Total Debit (Masuk)", value: formatRupiah(totalDebit), color: "#16A34A" },
              { label: "Total Kredit (Keluar)", value: formatRupiah(totalKredit), color: "#DC2626" },
              { label: "Saldo Akhir", value: formatRupiah(saldoAkhir), color: saldoAkhir >= 0 ? "#172033" : "#DC2626" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg border border-[#E2E6EC] p-4">
                <div className="text-xs text-[#667085] mb-2">{s.label}</div>
                <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E2E6EC] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#172033]">Buku Kas — Debit & Kredit</h3>
              <span className="text-xs text-[#667085]">01 Jul 2026 — 31 Agu 2026</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Referensi</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Keterangan</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-green-600">Debit (+)</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-red-500">Kredit (-)</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-[#667085]">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
                  <td className="px-5 py-3 text-sm text-[#667085]">01 Jul 2026</td>
                  <td className="px-4 py-3 text-sm text-[#667085]">-</td>
                  <td className="px-4 py-3 text-sm text-[#667085] italic">Saldo Awal</td>
                  <td className="px-4 py-3 text-sm text-right text-[#667085]">-</td>
                  <td className="px-4 py-3 text-sm text-right text-[#667085]">-</td>
                  <td className="px-5 py-3 text-sm text-right font-semibold text-[#172033]">{formatRupiah(saldoAwal)}</td>
                </tr>
                {laporanRows.map((row, i) => {
                  runningBalance += row.debit - row.kredit;
                  return (
                    <tr key={i} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm text-[#667085]">{formatDate(row.tanggal)}</td>
                      <td className="px-4 py-3 text-sm text-[#315DA8] text-xs">{row.referensi}</td>
                      <td className="px-4 py-3 text-sm text-[#172033]">{row.keterangan}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{row.debit > 0 ? formatRupiah(row.debit) : "-"}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-red-500">{row.kredit > 0 ? formatRupiah(row.kredit) : "-"}</td>
                      <td className="px-5 py-3 text-sm text-right font-semibold text-[#172033]">{formatRupiah(runningBalance)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#F9FAFB] border-t-2 border-[#E2E6EC]">
                  <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-[#172033]">Saldo Akhir</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-600">{formatRupiah(totalDebit)}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-red-500">{formatRupiah(totalKredit)}</td>
                  <td className="px-5 py-3 text-sm text-right font-bold text-[#173B6C]">{formatRupiah(saldoAkhir)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {tab === "invoice" && (
        <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Nomor Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Klien</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium text-[#173B6C]">{inv.nomorInvoice}</td>
                  <td className="px-4 py-3 text-sm text-[#667085]">{inv.klienNama}</td>
                  <td className="px-4 py-3 text-sm text-[#667085]">{formatDate(inv.tanggalInvoice)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#172033] text-right">{formatRupiah(inv.total)}</td>
                  <td className="px-4 py-3 text-sm text-[#667085] capitalize">{getPaymentSummary(inv, payments).statusPembayaran.replace(/_/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "pembayaran" && (
        <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E2E6EC] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#172033]">Laporan Pembayaran</h3>
            <span className="text-xs text-[#667085]">{filteredPembayaran.length} transaksi</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Nomor Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Klien</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Metode</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Rekening</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Nomor Referensi</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {filteredPembayaran.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada data pembayaran</td></tr>
              ) : filteredPembayaran.map(p => (
                <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-[#667085]">{formatDate(p.tanggal)}</td>
                  <td className="px-4 py-3 text-sm text-[#315DA8] font-medium">{p.nomorInvoice}</td>
                  <td className="px-4 py-3 text-sm text-[#172033]">{p.klienNama}</td>
                  <td className="px-4 py-3 text-sm text-[#667085]">{p.metode}</td>
                  <td className="px-4 py-3 text-sm text-[#667085]">{p.rekeningNama}</td>
                  <td className="px-4 py-3 text-xs text-[#667085] font-mono">{p.referensi || "-"}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">{formatRupiah(p.nominal)}</td>
                </tr>
              ))}
            </tbody>
            {filteredPembayaran.length > 0 && (
              <tfoot>
                <tr className="bg-[#F9FAFB] border-t-2 border-[#E2E6EC]">
                  <td colSpan={6} className="px-5 py-3 text-sm font-semibold text-[#172033]">Total</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                    {formatRupiah(filteredPembayaran.reduce((s, p) => s + p.nominal, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {tab === "pemasukan" && (
        <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E2E6EC] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#172033]">Laporan Pemasukan</h3>
            <span className="text-xs text-[#667085]">{filteredPemasukan.length} entri</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Sumber</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Keterangan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Ref. Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Rekening</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {filteredPemasukan.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada data pemasukan</td></tr>
              ) : filteredPemasukan.map(p => (
                <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-[#667085]">{formatDate(p.tanggal)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.sumber === "Invoice" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"}`}>{p.sumber}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#667085]">{p.kategori}</td>
                  <td className="px-4 py-3 text-sm text-[#172033]">{p.keterangan}</td>
                  <td className="px-4 py-3 text-sm text-[#315DA8]">{p.referensiInvoice || "-"}</td>
                  <td className="px-4 py-3 text-sm text-[#667085]">{p.rekeningNama}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">{formatRupiah(p.nominal)}</td>
                </tr>
              ))}
            </tbody>
            {filteredPemasukan.length > 0 && (
              <tfoot>
                <tr className="bg-[#F9FAFB] border-t-2 border-[#E2E6EC]">
                  <td colSpan={6} className="px-5 py-3 text-sm font-semibold text-[#172033]">Total</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                    {formatRupiah(filteredPemasukan.reduce((s, p) => s + p.nominal, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {tab === "pengeluaran" && (
        <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E2E6EC] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#172033]">Laporan Pengeluaran</h3>
            <span className="text-xs text-[#667085]">{filteredPengeluaran.length} entri</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Keterangan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Rekening</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {filteredPengeluaran.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada data pengeluaran</td></tr>
              ) : filteredPengeluaran.map(p => (
                <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-[#667085]">{formatDate(p.tanggal)}</td>
                  <td className="px-4 py-3 text-sm text-[#172033]">{p.vendorNama}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-[#667085] font-medium">{p.kategori}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#172033]">{p.keterangan}</td>
                  <td className="px-4 py-3 text-sm text-[#667085]">{p.rekeningNama}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600 text-right">{formatRupiah(p.nominal)}</td>
                </tr>
              ))}
            </tbody>
            {filteredPengeluaran.length > 0 && (
              <tfoot>
                <tr className="bg-[#F9FAFB] border-t-2 border-[#E2E6EC]">
                  <td colSpan={5} className="px-5 py-3 text-sm font-semibold text-[#172033]">Total</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                    {formatRupiah(filteredPengeluaran.reduce((s, p) => s + p.nominal, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
