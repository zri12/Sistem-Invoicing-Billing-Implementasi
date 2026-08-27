import { useState } from "react";
import { Search, Plus, MoreHorizontal, Package } from "lucide-react";
import { PRODUK, formatRupiah, type Produk } from "@/data/mock";
import { StatusBadge } from "@/components/Badge";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";

interface Props {
  isReadOnly: boolean;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function ProdukLayananPage({ isReadOnly, addToast }: Props) {
  const [data, setData] = useState(PRODUK);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Produk | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: "", deskripsi: "", harga: "", satuan: "project", status: "aktif" });

  const filtered = data.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm({ nama: "", deskripsi: "", harga: "", satuan: "project", status: "aktif" });
    setModalOpen(true);
  };

  const openEdit = (p: Produk) => {
    setEditTarget(p);
    setForm({ nama: p.nama, deskripsi: p.deskripsi, harga: p.harga.toString(), satuan: p.satuan, status: p.status });
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (editTarget) {
      setData(d => d.map(p => p.id === editTarget.id ? { ...p, ...form, harga: Number(form.harga) } as Produk : p));
      addToast("Produk & layanan berhasil diperbarui.");
    } else {
      setData(d => [{ id: "p" + Date.now(), ...form, harga: Number(form.harga) } as Produk, ...d]);
      addToast("Produk & layanan berhasil ditambahkan.");
    }
    setModalOpen(false);
  };

  const handleToggle = (p: Produk) => {
    setData(d => d.map(x => x.id === p.id ? { ...x, status: x.status === "aktif" ? "nonaktif" : "aktif" } : x));
    setMenuOpen(null);
    addToast("Status berhasil diperbarui.");
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Produk & Layanan</h1>
          <p className="text-sm text-[#667085] mt-0.5">Daftar produk dan layanan yang dapat ditambahkan ke dalam invoice.</p>
        </div>
        {!isReadOnly && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Tambah Produk / Layanan
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="input search-input w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-36">
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>
      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Nama</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Deskripsi</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#667085]">Harga Awal</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Satuan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                  <Package size={32} className="opacity-40" />
                  <div className="text-sm">Belum ada produk & layanan</div>
                </div>
              </td></tr>
            ) : filtered.map((p, index) => (
              <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                <td className="px-5 py-3.5 text-sm font-medium text-[#172033]">{p.nama}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085] max-w-xs truncate">{p.deskripsi}</td>
                <td className="px-4 py-3.5 text-sm text-[#172033] text-right font-medium">{formatRupiah(p.harga)}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{p.satuan}</td>
                <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3.5 relative">
                  <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className="p-1.5 rounded hover:bg-gray-100 text-[#667085]">
                    <MoreHorizontal size={15} />
                  </button>
                  {menuOpen === p.id && (
                    <div className={`absolute right-4 ${index >= filtered.length - 3 ? "bottom-10" : "top-10"} z-20 bg-white rounded-lg shadow-lg border border-[#E2E6EC] py-1 w-40`}>
                      {!isReadOnly && <button onClick={() => openEdit(p)} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Edit</button>}
                      {!isReadOnly && <button onClick={() => handleToggle(p)} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">{p.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}</button>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Produk / Layanan" : "Tambah Produk / Layanan"}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button><button onClick={handleSave} className="btn-primary">Simpan</button></>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Nama Produk / Layanan <span className="text-red-500">*</span></label>
            <input className="input w-full" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} /></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Deskripsi</label>
            <textarea className="input w-full h-16 resize-none" value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Harga Awal (Rp)</label>
              <input type="number" className="input w-full" value={form.harga} onChange={e => setForm({ ...form, harga: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Satuan</label>
              <input className="input w-full" value={form.satuan} onChange={e => setForm({ ...form, satuan: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Status</label>
            <select className="input w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </Modal>
      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
