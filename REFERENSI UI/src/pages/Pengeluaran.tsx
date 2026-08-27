import { useState } from "react";
import { Search, Plus, TrendingDown } from "lucide-react";
import { PENGELUARAN, REKENING, VENDOR, formatRupiah, formatDate, type Pengeluaran } from "@/data/mock";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import DetailsModal from "@/components/DetailsModal";

interface Props {
  isReadOnly: boolean;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function PengeluaranPage({ isReadOnly, addToast }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<Pengeluaran[]>(PENGELUARAN);
  const [editTarget, setEditTarget] = useState<Pengeluaran | null>(null);
  const [detailTarget, setDetailTarget] = useState<Pengeluaran | null>(null);
  const [proofFile, setProofFile] = useState("");
  const [form, setForm] = useState({ tanggal: "", vendorId: "", kategori: "", keterangan: "", rekeningId: "r1", nominal: "", catatan: "" });

  const filtered = data.filter(p =>
    p.keterangan.toLowerCase().includes(search.toLowerCase()) || p.vendorNama.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, p) => s + p.nominal, 0);

  const handleSave = () => {
    const nominal = Number(form.nominal);
    if (!form.tanggal || !form.kategori.trim() || !form.keterangan.trim() || nominal <= 0) {
      addToast("Lengkapi tanggal, kategori, keterangan, dan nominal pengeluaran.", "error");
      return;
    }
    const rekening = REKENING.find(item => item.id === form.rekeningId);
    const vendor = VENDOR.find(item => item.id === form.vendorId);
    const savedEntry: Pengeluaran = {
      id: `pe-manual-${Date.now()}`,
      tanggal: form.tanggal,
      vendorId: form.vendorId,
      vendorNama: vendor?.nama ?? "-",
      kategori: form.kategori.trim(),
      keterangan: form.keterangan.trim(),
      rekeningId: form.rekeningId,
      rekeningNama: rekening?.namaBankKas ?? "-",
      nominal,
      bukti: proofFile,
      catatan: form.catatan,
    };
    if (editTarget) {
      setData(previous => previous.map(item => item.id === editTarget.id ? { ...savedEntry, id: editTarget.id, bukti: proofFile || editTarget.bukti } : item));
      addToast("Pengeluaran berhasil diperbarui.");
    } else {
      setData(previous => [...previous, savedEntry]);
      addToast("Pengeluaran berhasil ditambahkan.");
    }
    setModalOpen(false);
    setEditTarget(null);
    setProofFile("");
    setForm({ tanggal: "", vendorId: "", kategori: "", keterangan: "", rekeningId: "r1", nominal: "", catatan: "" });
  };

  const openAdd = () => {
    setEditTarget(null);
    setProofFile("");
    setForm({ tanggal: "", vendorId: "", kategori: "", keterangan: "", rekeningId: "r1", nominal: "", catatan: "" });
    setModalOpen(true);
  };

  const openEdit = (entry: Pengeluaran) => {
    setEditTarget(entry);
    setProofFile(entry.bukti);
    setForm({ tanggal: entry.tanggal, vendorId: entry.vendorId, kategori: entry.kategori, keterangan: entry.keterangan, rekeningId: entry.rekeningId, nominal: entry.nominal.toString(), catatan: entry.catatan });
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Pengeluaran</h1>
          <p className="text-sm text-[#667085] mt-0.5">Pencatatan seluruh pengeluaran dan biaya operasional perusahaan.</p>
        </div>
        {!isReadOnly && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Tambah Pengeluaran
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[#E2E6EC] p-4 mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-[#667085]">Total Pengeluaran</div>
          <div className="text-2xl font-bold text-[#DC2626]">{formatRupiah(total)}</div>
        </div>
        <TrendingDown size={32} className="text-red-200" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengeluaran..." className="input search-input w-full" />
        </div>
        <select className="input w-36">
          <option>Semua Periode</option>
          <option>Bulan Ini</option>
        </select>
        <select className="input w-40">
          <option>Semua Vendor</option>
          <option>CV Mitra Cloud Solutions</option>
          <option>PT Sumber Daya Komputindo</option>
        </select>
        <select className="input w-40">
          <option>Semua Kategori</option>
          <option>Infrastruktur</option>
          <option>Peralatan</option>
          <option>Operasional</option>
          <option>Marketing</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Vendor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Kategori</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Keterangan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Rekening</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Nominal</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Bukti</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                <td className="px-5 py-3.5 text-sm text-[#667085]">{formatDate(p.tanggal)}</td>
                <td className="px-4 py-3.5 text-sm text-[#172033]">{p.vendorNama}</td>
                <td className="px-4 py-3.5">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-[#667085] font-medium">{p.kategori}</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-[#172033]">{p.keterangan}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{p.rekeningNama}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-red-600 text-right">{formatRupiah(p.nominal)}</td>
                <td className="px-4 py-3.5">
                  {p.bukti ? <button onClick={() => setDetailTarget(p)} className="text-xs text-[#315DA8] hover:underline">Lihat</button> : <span className="text-xs text-[#9CA3AF]">-</span>}
                </td>
                <td className="px-4 py-3.5">
                  {!isReadOnly && <button onClick={() => openEdit(p)} className="text-xs text-[#315DA8] hover:underline">Edit</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); setProofFile(""); }} title={editTarget ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button><button onClick={handleSave} className="btn-primary">Simpan</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Tanggal</label>
              <input type="date" className="input w-full" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Nominal (Rp)</label>
              <input type="number" className="input w-full" value={form.nominal} onChange={e => setForm({ ...form, nominal: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Vendor</label>
            <select className="input w-full" value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })}>
              <option value="">- Tanpa Vendor -</option>
              <option value="v1">PT Sumber Daya Komputindo</option>
              <option value="v2">CV Mitra Cloud Solutions</option>
              <option value="v3">PT Kreasi Media Utama</option>
            </select></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Kategori</label>
            <input className="input w-full" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} placeholder="Infrastruktur, Operasional, dll." /></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Keterangan</label>
            <textarea className="input w-full h-16 resize-none" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} /></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Rekening Sumber <span className="text-red-500">*</span></label>
            <select className="input w-full" value={form.rekeningId} onChange={e => setForm({ ...form, rekeningId: e.target.value })}>
              {REKENING.filter(r => r.status === "aktif").map(r => (
                <option key={r.id} value={r.id}>{r.namaBankKas} — {r.nomorRekening}</option>
              ))}
            </select></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Bukti Transaksi</label>
            <input id="expense-proof" type="file" accept=".jpg,.jpeg,.png,.pdf" className="sr-only" onChange={e => setProofFile(e.target.files?.[0]?.name ?? "")} />
            <label htmlFor="expense-proof" className="block border-2 border-dashed border-[#E2E6EC] rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 text-sm text-[#9CA3AF]">
              {proofFile || "Klik untuk unggah file bukti"}
            </label></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Catatan</label>
            <textarea className="input w-full h-14 resize-none" value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} placeholder="Catatan tambahan (opsional)" /></div>
        </div>
      </Modal>
      <DetailsModal
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Detail Bukti Transaksi"
        subtitle={detailTarget?.bukti ? `Bukti: ${detailTarget.bukti}` : undefined}
        fields={detailTarget ? [
          { label: "Tanggal", value: formatDate(detailTarget.tanggal) },
          { label: "Vendor", value: detailTarget.vendorNama },
          { label: "Keterangan", value: detailTarget.keterangan },
          { label: "Nominal", value: formatRupiah(detailTarget.nominal) },
        ] : []}
      />
    </div>
  );
}
