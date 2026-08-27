import { useState } from "react";
import { Search, Wallet } from "lucide-react";
import { formatRupiah, formatDate, type Pembayaran } from "@/data/mock";
import Pagination from "@/components/Pagination";
import DetailsModal from "@/components/DetailsModal";

interface Props {
  isReadOnly: boolean;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  payments: Pembayaran[];
}

export default function PembayaranPage({ isReadOnly, payments }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<Pembayaran | null>(null);

  const data = payments;
  const filtered = data.filter(p =>
    p.nomorInvoice.toLowerCase().includes(search.toLowerCase()) ||
    p.klienNama.toLowerCase().includes(search.toLowerCase())
  );

  const totalNominal = filtered.reduce((s, p) => s + p.nominal, 0);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Pembayaran</h1>
          <p className="text-sm text-[#667085] mt-0.5">Riwayat semua pembayaran yang telah diterima.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-4">
          <div className="text-xs text-[#667085] mb-2">Total Pembayaran Diterima</div>
          <div className="text-xl font-bold text-[#16A34A]">{formatRupiah(totalNominal)}</div>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-4">
          <div className="text-xs text-[#667085] mb-2">Jumlah Transaksi</div>
          <div className="text-xl font-bold text-[#172033]">{filtered.length}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari invoice, klien..." className="input search-input w-full" />
        </div>
        <select className="input w-44">
          <option>Semua Periode</option>
          <option>Bulan Ini</option>
          <option>Bulan Lalu</option>
        </select>
        <select className="input w-40">
          <option>Semua Metode</option>
          <option>Transfer Bank</option>
          <option>Kas</option>
          <option>QRIS</option>
        </select>
        <select className="input w-36">
          <option>Semua Rekening</option>
          <option>BCA</option>
          <option>Mandiri</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Klien</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Metode</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Referensi</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Rekening</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Nominal</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                  <Wallet size={32} className="opacity-40" />
                  <div className="text-sm">Belum ada data pembayaran</div>
                </div>
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                <td className="px-5 py-3.5 text-sm text-[#667085]">{formatDate(p.tanggal)}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-[#173B6C]">{p.nomorInvoice}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{p.klienNama}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{p.metode}</td>
                <td className="px-4 py-3.5 text-xs text-[#667085] font-mono">{p.referensi}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{p.rekeningNama}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-[#172033] text-right">{formatRupiah(p.nominal)}</td>
                <td className="px-4 py-3.5 text-xs text-[#315DA8]"><button onClick={() => setDetailTarget(p)} className="hover:underline">Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>
      <DetailsModal
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Detail Pembayaran"
        fields={detailTarget ? [
          { label: "Tanggal", value: formatDate(detailTarget.tanggal) },
          { label: "Nomor Invoice", value: detailTarget.nomorInvoice },
          { label: "Klien", value: detailTarget.klienNama },
          { label: "Metode", value: detailTarget.metode },
          { label: "Rekening", value: detailTarget.rekeningNama },
          { label: "Referensi", value: detailTarget.referensi || "-" },
          { label: "Nominal", value: formatRupiah(detailTarget.nominal) },
        ] : []}
      />
    </div>
  );
}
