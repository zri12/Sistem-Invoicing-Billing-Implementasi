import { useState } from "react";
import { Plus, MoreHorizontal, UserCog } from "lucide-react";
import { USERS, type User } from "@/data/mock";
import { StatusBadge } from "@/components/Badge";
import Modal from "@/components/Modal";

interface Props {
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const rolePermissions = [
  { permission: "Dashboard & Laporan (lihat)", admin: true, manager: true },
  { permission: "Kelola Klien", admin: true, manager: false },
  { permission: "Lihat Klien & Vendor", admin: true, manager: true },
  { permission: "Buat & Edit Invoice", admin: true, manager: false },
  { permission: "Lihat Invoice & Preview", admin: true, manager: true },
  { permission: "Catat Pembayaran", admin: true, manager: false },
  { permission: "Lihat Pembayaran", admin: true, manager: true },
  { permission: "Tambah Pemasukan Manual", admin: true, manager: false },
  { permission: "Lihat Pemasukan", admin: true, manager: true },
  { permission: "Tambah Pengeluaran", admin: true, manager: false },
  { permission: "Lihat Pengeluaran", admin: true, manager: true },
  { permission: "Data Perusahaan (edit)", admin: true, manager: false },
  { permission: "Template & Penomoran Invoice", admin: true, manager: false },
  { permission: "Kelola Pengguna", admin: true, manager: false },
];

export default function PenggunaPage({ addToast }: Props) {
  const [data, setData] = useState(USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: "", email: "", username: "", password: "", role: "admin", status: "aktif" });
  const [showPermissions, setShowPermissions] = useState(false);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ nama: "", email: "", username: "", password: "", role: "admin", status: "aktif" });
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditTarget(u);
    setForm({ nama: u.nama, email: u.email, username: u.username, password: "", role: u.role, status: u.status });
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (editTarget) {
      setData(d => d.map(u => u.id === editTarget.id ? { ...u, ...form } as User : u));
      addToast("Data pengguna berhasil diperbarui.");
    } else {
      setData(d => [...d, { id: "u" + Date.now(), ...form } as User]);
      addToast("Pengguna berhasil ditambahkan.");
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Pengguna & Hak Akses</h1>
          <p className="text-sm text-[#667085] mt-0.5">Kelola pengguna internal dan hak akses berdasarkan peran.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden mb-5">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Nama</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Username / Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u, index) => (
              <tr key={u.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2F8] flex items-center justify-center text-xs font-semibold text-[#173B6C]">
                      {u.nama.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <span className="text-sm font-medium text-[#172033]">{u.nama}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-sm text-[#667085]">{u.username}</div>
                  <div className="text-xs text-[#9CA3AF]">{u.email}</div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${u.role === "admin" ? "bg-[#EEF2F8] text-[#173B6C]" : "bg-purple-50 text-purple-700"}`}>
                    {u.role === "admin" ? "Admin / Finance" : "Pimpinan / Manager"}
                  </span>
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3.5 relative">
                  <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)} className="p-1.5 rounded hover:bg-gray-100 text-[#667085]">
                    <MoreHorizontal size={15} />
                  </button>
                  {menuOpen === u.id && (
                    <div className={`absolute right-4 ${index >= data.length - 3 ? "bottom-10" : "top-10"} z-20 bg-white rounded-lg shadow-lg border border-[#E2E6EC] py-1 w-40`}>
                      <button onClick={() => openEdit(u)} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Edit</button>
                      <button onClick={() => { setData(d => d.map(x => x.id === u.id ? { ...x, status: x.status === "aktif" ? "nonaktif" : "aktif" } : x)); setMenuOpen(null); addToast("Status pengguna diperbarui."); }}
                        className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">{u.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role permissions overview */}
      <div className="bg-white rounded-lg border border-[#E2E6EC]">
        <button
          onClick={() => setShowPermissions(!showPermissions)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <UserCog size={16} className="text-[#667085]" />
            <h3 className="text-sm font-semibold text-[#172033]">Ringkasan Hak Akses Per Peran</h3>
          </div>
          <span className="text-xs text-[#315DA8]">{showPermissions ? "Sembunyikan" : "Tampilkan"}</span>
        </button>
        {showPermissions && (
          <div className="border-t border-[#E2E6EC] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Fitur / Aksi</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[#173B6C]">Admin / Finance</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-purple-700">Pimpinan / Manager</th>
                </tr>
              </thead>
              <tbody>
                {rolePermissions.map(p => (
                  <tr key={p.permission} className="border-b border-[#F3F4F6]">
                    <td className="px-5 py-2.5 text-sm text-[#172033]">{p.permission}</td>
                    <td className="px-4 py-2.5 text-center">{p.admin ? <span className="text-green-600 text-base">✓</span> : <span className="text-gray-300 text-base">—</span>}</td>
                    <td className="px-4 py-2.5 text-center">{p.manager ? <span className="text-green-600 text-base">✓</span> : <span className="text-gray-300 text-base">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Pengguna" : "Tambah Pengguna"}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button><button onClick={handleSave} className="btn-primary">Simpan</button></>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input className="input w-full" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Username</label>
              <input className="input w-full" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Email</label>
              <input type="email" className="input w-full" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Password {editTarget && <span className="font-normal text-[#9CA3AF]">(kosongkan jika tidak diubah)</span>}</label>
            <input type="password" className="input w-full" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Role</label>
              <select className="input w-full" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin / Finance</option>
                <option value="manager">Pimpinan / Manager</option>
              </select></div>
            <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Status</label>
              <select className="input w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select></div>
          </div>
        </div>
      </Modal>
      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
