import { useState } from "react";
import { Search, Plus, MoreHorizontal, Building2 } from "lucide-react";
import { VENDOR, type Vendor } from "@/data/mock";
import { StatusBadge } from "@/components/Badge";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import DetailsModal from "@/components/DetailsModal";

interface Props {
  isReadOnly: boolean;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function VendorPage({ isReadOnly, addToast }: Props) {
  const [data, setData] = useState(VENDOR);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ nama: "", pic: "", alamat: "", telepon: "", email: "", catatan: "", status: "aktif" });

  const filtered = data.filter(v => {
    const matchSearch = v.nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm({ nama: "", pic: "", alamat: "", telepon: "", email: "", catatan: "", status: "aktif" });
    setModalOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditTarget(v);
    setForm({ nama: v.nama, pic: v.pic, alamat: v.alamat, telepon: v.telepon, email: v.email, catatan: v.catatan, status: v.status });
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (editTarget) {
      setData(d => d.map(v => v.id === editTarget.id ? { ...v, ...form } as Vendor : v));
      addToast("Data vendor berhasil diperbarui.");
    } else {
      setData(d => [{ id: "v" + Date.now(), ...form as any, jumlahTransaksi: 0 }, ...d]);
      addToast("Vendor berhasil ditambahkan.");
    }
    setModalOpen(false);
  };

  const handleToggle = (v: Vendor) => {
    setData(d => d.map(x => x.id === v.id ? { ...x, status: x.status === "aktif" ? "nonaktif" : "aktif" } : x));
    addToast(`Vendor berhasil ${v.status === "aktif" ? "dinonaktifkan" : "diaktifkan"}.`);
    setMenuOpen(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Vendor</h1>
          <p className="text-sm text-[#667085] mt-0.5">Data vendor digunakan pada pencatatan pengeluaran perusahaan.</p>
        </div>
        {!isReadOnly && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Tambah Vendor
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari vendor..." className="input search-input w-full" />
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
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Vendor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">PIC</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Telepon</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Status</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-[#667085]">Transaksi</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                  <Building2 size={32} className="opacity-40" />
                  <div className="text-sm">Belum ada data vendor</div>
                </div>
              </td></tr>
            ) : filtered.map((v, index) => (
              <tr key={v.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                <td className="px-5 py-3.5 text-sm font-medium text-[#172033]">{v.nama}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{v.pic}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{v.telepon}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{v.email || "-"}</td>
                <td className="px-4 py-3.5"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3.5 text-center text-sm text-[#667085]">{v.jumlahTransaksi}</td>
                <td className="px-4 py-3.5 relative">
                  <button onClick={() => setMenuOpen(menuOpen === v.id ? null : v.id)} className="p-1.5 rounded hover:bg-gray-100 text-[#667085]">
                    <MoreHorizontal size={15} />
                  </button>
                  {menuOpen === v.id && (
                    <div className={`absolute right-4 ${index >= filtered.length - 3 ? "bottom-10" : "top-10"} z-20 bg-white rounded-lg shadow-lg border border-[#E2E6EC] py-1 w-44`}>
                      {!isReadOnly && <button onClick={() => openEdit(v)} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Edit</button>}
                      <button onClick={() => { setMenuOpen(null); setHistoryTarget(v); }} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Riwayat Transaksi</button>
                      {!isReadOnly && <button onClick={() => handleToggle(v)} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">{v.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}</button>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} onChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Vendor" : "Tambah Vendor"}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button><button onClick={handleSave} className="btn-primary">Simpan</button></>}>
        <div className="space-y-4">
          {[
            { label: "Nama Vendor", key: "nama", placeholder: "Nama perusahaan vendor" },
            { label: "Nama PIC", key: "pic", placeholder: "Nama penanggung jawab" },
            { label: "Nomor Telepon", key: "telepon", placeholder: "021-..." },
            { label: "Email", key: "email", placeholder: "email@domain.com" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">{f.label}</label>
              <input className="input w-full" value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Alamat</label>
            <textarea className="input w-full h-16 resize-none" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Status</label>
            <select className="input w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </Modal>
      <DetailsModal
        open={Boolean(historyTarget)}
        onClose={() => setHistoryTarget(null)}
        title="Riwayat Transaksi Vendor"
        subtitle={historyTarget ? `Ringkasan transaksi untuk ${historyTarget.nama}.` : undefined}
        fields={historyTarget ? [
          { label: "Vendor", value: historyTarget.nama },
          { label: "PIC", value: historyTarget.pic },
          { label: "Jumlah Transaksi", value: historyTarget.jumlahTransaksi },
          { label: "Status Vendor", value: historyTarget.status === "aktif" ? "Aktif" : "Nonaktif" },
        ] : []}
      />
      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
