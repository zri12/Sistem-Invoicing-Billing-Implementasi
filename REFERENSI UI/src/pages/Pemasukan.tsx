import { useState } from "react";
import { Search, Plus, TrendingUp } from "lucide-react";
import { REKENING, formatRupiah, formatDate, type Pemasukan } from "@/data/mock";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";

interface Props {
  isReadOnly: boolean;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  pemasukan: Pemasukan[];
}

export default function PemasukanPage({ isReadOnly, addToast, pemasukan }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [manualEntries, setManualEntries] = useState<Pemasukan[]>([]);
  const [editTarget, setEditTarget] = useState<Pemasukan | null>(null);
  const [form, setForm] = useState({ tanggal: "", sumber: "Lain-lain", kategori: "", keterangan: "", rekeningId: "r1", nominal: "" });

  const allPemasukan = [...pemasukan, ...manualEntries];
  const filtered = allPemasukan.filter(p =>
    p.keterangan.toLowerCase().includes(search.toLowerCase()) || p.sumber.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, p) => s + p.nominal, 0);

  const handleSave = () => {
    const nominal = Number(form.nominal);
    if (!form.tanggal || !form.kategori.trim() || !form.keterangan.trim() || nominal <= 0) {
      addToast("Lengkapi tanggal, kategori, keterangan, dan nominal pemasukan.", "error");
      return;
    }
    const rekening = REKENING.find(item => item.id === form.rekeningId);
    const savedEntry: Pemasukan = {
      id: `pm-manual-${Date.now()}`,
      tanggal: form.tanggal,
      sumber: form.sumber.trim() || "Lain-lain",
      kategori: form.kategori.trim(),
      keterangan: form.keterangan.trim(),
      referensiInvoice: "",
      rekeningId: form.rekeningId,
      rekeningNama: rekening?.namaBankKas ?? "-",
      nominal,
    };
    if (editTarget) {
      setManualEntries(previous => previous.map(item => item.id === editTarget.id ? { ...savedEntry, id: editTarget.id } : item));
      addToast("Pemasukan berhasil diperbarui.");
    } else {
      setManualEntries(previous => [...previous, savedEntry]);
      addToast("Pemasukan berhasil ditambahkan.");
    }
    setModalOpen(false);
    setEditTarget(null);
    setForm({ tanggal: "", sumber: "Lain-lain", kategori: "", keterangan: "", rekeningId: "r1", nominal: "" });
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ tanggal: "", sumber: "Lain-lain", kategori: "", keterangan: "", rekeningId: "r1", nominal: "" });
    setModalOpen(true);
  };

  const openEdit = (entry: Pemasukan) => {
    setEditTarget(entry);
    setForm({ tanggal: entry.tanggal, sumber: entry.sumber, kategori: entry.kategori, keterangan: entry.keterangan, rekeningId: entry.rekeningId, nominal: entry.nominal.toString() });
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Pemasukan</h1>
          <p className="text-sm text-[#667085] mt-0.5">Pencatatan seluruh penerimaan kas dan bank perusahaan.</p>
        </div>
        {!isReadOnly && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Tambah Pemasukan
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-[#E2E6EC] p-4 mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-[#667085]">Total Pemasukan</div>
          <div className="text-2xl font-bold text-[#16A34A]">{formatRupiah(total)}</div>
        </div>
        <TrendingUp size={32} className="text-green-200" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pemasukan..." className="input search-input w-full" />
        </div>
        <select className="input w-36">
          <option>Semua Periode</option>
          <option>Bulan Ini</option>
        </select>
        <select className="input w-40">
          <option>Semua Kategori</option>
          <option>Pendapatan Jasa</option>
          <option>Pendapatan Lainnya</option>
        </select>
        <select className="input w-36">
          <option>Semua Rekening</option>
          <option>BCA</option>
          <option>Mandiri</option>
          <option>Kas Kantor</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
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
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                <td className="px-5 py-3.5 text-sm text-[#667085]">{formatDate(p.tanggal)}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.sumber === "Invoice" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"}`}>{p.sumber}</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{p.kategori}</td>
                <td className="px-4 py-3.5 text-sm text-[#172033]">{p.keterangan}</td>
                <td className="px-4 py-3.5 text-sm text-[#315DA8]">{p.referensiInvoice || "-"}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{p.rekeningNama}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-green-600 text-right">{formatRupiah(p.nominal)}</td>
                <td className="px-4 py-3.5 text-xs text-[#315DA8]">
                  {p.sumber !== "Invoice" && !isReadOnly && <button onClick={() => openEdit(p)} className="hover:underline">Edit</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} title={editTarget ? "Edit Pemasukan Manual" : "Tambah Pemasukan Manual"}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button><button onClick={handleSave} className="btn-primary">Simpan</button></>}>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-700">
            Formulir ini untuk pemasukan <strong>non-invoice</strong>. Pembayaran invoice dicatat otomatis melalui fitur Catat Pembayaran.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Tanggal <span className="text-red-500">*</span></label>
              <input type="date" className="input w-full" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Nominal (Rp) <span className="text-red-500">*</span></label>
              <input type="number" className="input w-full" value={form.nominal} onChange={e => setForm({ ...form, nominal: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Sumber</label>
            <input className="input w-full" value={form.sumber} onChange={e => setForm({ ...form, sumber: e.target.value })} placeholder="Lain-lain, Reimburse, dll." /></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Kategori</label>
            <input className="input w-full" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} placeholder="Pendapatan Jasa, Pendapatan Lainnya, dll." /></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Rekening <span className="text-red-500">*</span></label>
            <select className="input w-full" value={form.rekeningId} onChange={e => setForm({ ...form, rekeningId: e.target.value })}>
              {REKENING.filter(r => r.status === "aktif").map(r => (
                <option key={r.id} value={r.id}>{r.namaBankKas} — {r.nomorRekening}</option>
              ))}
            </select></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Keterangan</label>
            <textarea className="input w-full h-16 resize-none" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}
