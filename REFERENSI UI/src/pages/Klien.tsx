import { useState } from "react";
import { Search, Plus, MoreHorizontal, Users } from "lucide-react";
import { KLIEN, type Klien } from "@/data/mock";
import { StatusBadge } from "@/components/Badge";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Pagination from "@/components/Pagination";
import DetailsModal from "@/components/DetailsModal";

interface Props {
  isReadOnly: boolean;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function KlienPage({ isReadOnly, addToast }: Props) {
  const [data, setData] = useState(KLIEN);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Klien | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Klien | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Klien | null>(null);
  const [form, setForm] = useState({ nama: "", pic: "", alamat: "", telepon: "", email: "", catatan: "", status: "aktif" });

  const filtered = data.filter(k => {
    const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase()) || k.pic.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "semua" || k.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm({ nama: "", pic: "", alamat: "", telepon: "", email: "", catatan: "", status: "aktif" });
    setModalOpen(true);
  };

  const openEdit = (k: Klien) => {
    setEditTarget(k);
    setForm({ nama: k.nama, pic: k.pic, alamat: k.alamat, telepon: k.telepon, email: k.email, catatan: k.catatan, status: k.status });
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (editTarget) {
      setData(d => d.map(k => k.id === editTarget.id ? { ...k, ...form } as Klien : k));
      addToast("Data klien berhasil diperbarui.");
    } else {
      const newK: Klien = { id: "k" + Date.now(), ...form as any, jumlahInvoice: 0 };
      setData(d => [newK, ...d]);
      addToast("Klien berhasil ditambahkan.");
    }
    setModalOpen(false);
  };

  const handleToggle = (k: Klien) => {
    setData(d => d.map(x => x.id === k.id ? { ...x, status: x.status === "aktif" ? "nonaktif" : "aktif" } : x));
    addToast(`Klien berhasil ${k.status === "aktif" ? "dinonaktifkan" : "diaktifkan"}.`);
    setMenuOpen(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Klien</h1>
          <p className="text-sm text-[#667085] mt-0.5">Data klien digunakan sebagai pihak penerima tagihan invoice.</p>
        </div>
        {!isReadOnly && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Tambah Klien
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari klien..." className="input search-input w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-36">
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Nama Klien / Perusahaan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">PIC</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Telepon</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Status</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-[#667085]">Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                  <Users size={32} className="opacity-40" />
                  <div className="text-sm">Belum ada data klien</div>
                </div>
              </td></tr>
            ) : filtered.map((k, index) => (
              <tr key={k.id} className="border-b border-[#F3F4F6] hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="text-sm font-medium text-[#172033]">{k.nama}</div>
                </td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{k.pic}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{k.telepon}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{k.email}</td>
                <td className="px-4 py-3.5"><StatusBadge status={k.status} /></td>
                <td className="px-4 py-3.5 text-center text-sm text-[#667085]">{k.jumlahInvoice}</td>
                <td className="px-4 py-3.5 relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === k.id ? null : k.id)}
                    className="p-1.5 rounded hover:bg-gray-100 text-[#667085]"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {menuOpen === k.id && (
                    <div className={`absolute right-4 ${index >= filtered.length - 3 ? "bottom-10" : "top-10"} z-20 bg-white rounded-lg shadow-lg border border-[#E2E6EC] py-1 w-44`}>
                      {!isReadOnly && (
                        <button onClick={() => openEdit(k)} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Edit</button>
                      )}
                      <button onClick={() => { setMenuOpen(null); setHistoryTarget(k); }} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Riwayat Invoice</button>
                      {!isReadOnly && (
                        <button onClick={() => handleToggle(k)} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">
                          {k.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                        </button>
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

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Klien" : "Tambah Klien"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button onClick={handleSave} className="btn-primary">Simpan</button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Nama Klien / Perusahaan" required>
            <input className="input w-full" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama perusahaan atau klien" />
          </FormField>
          <FormField label="Nama PIC">
            <input className="input w-full" value={form.pic} onChange={e => setForm({ ...form, pic: e.target.value })} placeholder="Nama penanggung jawab" />
          </FormField>
          <FormField label="Alamat">
            <textarea className="input w-full h-16 resize-none" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nomor Telepon">
              <input className="input w-full" value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} placeholder="021-..." />
            </FormField>
            <FormField label="Email">
              <input type="email" className="input w-full" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@domain.com" />
            </FormField>
          </div>
          <FormField label="Catatan">
            <textarea className="input w-full h-16 resize-none" value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} placeholder="Catatan tambahan" />
          </FormField>
          <FormField label="Status">
            <select className="input w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </FormField>
        </div>
      </Modal>

      <DetailsModal
        open={Boolean(historyTarget)}
        onClose={() => setHistoryTarget(null)}
        title="Riwayat Invoice Klien"
        subtitle={historyTarget ? `Ringkasan invoice untuk ${historyTarget.nama}.` : undefined}
        fields={historyTarget ? [
          { label: "Nama Klien", value: historyTarget.nama },
          { label: "PIC", value: historyTarget.pic },
          { label: "Jumlah Invoice", value: historyTarget.jumlahInvoice },
          { label: "Status Klien", value: historyTarget.status === "aktif" ? "Aktif" : "Nonaktif" },
        ] : []}
      />

      {/* Click outside */}
      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#172033] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
