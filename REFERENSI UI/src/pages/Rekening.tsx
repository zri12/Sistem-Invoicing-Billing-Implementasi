import { useState } from "react";
import { Plus, MoreHorizontal, CreditCard } from "lucide-react";
import { REKENING, type Rekening } from "@/data/mock";
import { StatusBadge } from "@/components/Badge";
import Modal from "@/components/Modal";

interface Props {
  isReadOnly: boolean;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function RekeningPage({ isReadOnly, addToast }: Props) {
  const [data, setData] = useState(REKENING);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Rekening | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ namaBankKas: "", nomorRekening: "", atasNama: "", status: "aktif" });

  const openAdd = () => {
    setEditTarget(null);
    setForm({ namaBankKas: "", nomorRekening: "", atasNama: "", status: "aktif" });
    setModalOpen(true);
  };

  const openEdit = (r: Rekening) => {
    setEditTarget(r);
    setForm({ namaBankKas: r.namaBankKas, nomorRekening: r.nomorRekening, atasNama: r.atasNama, status: r.status });
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (editTarget) {
      setData(d => d.map(r => r.id === editTarget.id ? { ...r, namaBankKas: form.namaBankKas, nomorRekening: form.nomorRekening, atasNama: form.atasNama, status: form.status as "aktif" | "nonaktif" } : r));
      addToast("Data rekening berhasil diperbarui.");
    } else {
      const newRek: Rekening = { id: "r" + Date.now(), namaBankKas: form.namaBankKas, nomorRekening: form.nomorRekening, atasNama: form.atasNama, saldo: 0, status: form.status as "aktif" | "nonaktif" };
      setData(d => [...d, newRek]);
      addToast("Rekening berhasil ditambahkan.");
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Rekening</h1>
          <p className="text-sm text-[#667085] mt-0.5">Kelola rekening bank dan kas perusahaan untuk pencatatan keuangan.</p>
        </div>
        {!isReadOnly && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Tambah Rekening
          </button>
        )}
      </div>
      <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E6EC]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#667085]">Nama Bank / Kas</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Nomor Rekening</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Atas Nama</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#667085]">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-[#667085]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, index) => (
              <tr key={r.id} className="border-b border-[#F3F4F6] hover:bg-gray-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#EEF2F8] flex items-center justify-center">
                      <CreditCard size={14} className="text-[#173B6C]" />
                    </div>
                    <span className="text-sm font-medium text-[#172033]">{r.namaBankKas}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-[#667085] font-mono">{r.nomorRekening}</td>
                <td className="px-4 py-3.5 text-sm text-[#667085]">{r.atasNama}</td>
                <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3.5 relative">
                  {!isReadOnly && (
                    <>
                      <button onClick={() => setMenuOpen(menuOpen === r.id ? null : r.id)} className="p-1.5 rounded hover:bg-gray-100 text-[#667085]">
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpen === r.id && (
                        <div className={`absolute right-4 ${index >= data.length - 3 ? "bottom-10" : "top-10"} z-20 bg-white rounded-lg shadow-lg border border-[#E2E6EC] py-1 w-36`}>
                          <button onClick={() => openEdit(r)} className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">Edit</button>
                          <button onClick={() => { setData(d => d.map(x => x.id === r.id ? { ...x, status: x.status === "aktif" ? "nonaktif" : "aktif" } : x)); setMenuOpen(null); addToast("Status rekening diperbarui."); }}
                            className="w-full text-left px-4 py-2 text-sm text-[#172033] hover:bg-gray-50">{r.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}</button>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Rekening" : "Tambah Rekening"}
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button><button onClick={handleSave} className="btn-primary">Simpan</button></>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Nama Bank / Kas <span className="text-red-500">*</span></label>
            <input className="input w-full" value={form.namaBankKas} onChange={e => setForm({ ...form, namaBankKas: e.target.value })} placeholder="BCA, Mandiri, Kas Kantor..." /></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Nomor Rekening</label>
            <input className="input w-full font-mono" value={form.nomorRekening} onChange={e => setForm({ ...form, nomorRekening: e.target.value })} placeholder="Nomor rekening bank" /></div>
          <div><label className="block text-sm font-medium text-[#172033] mb-1.5">Atas Nama</label>
            <input className="input w-full" value={form.atasNama} onChange={e => setForm({ ...form, atasNama: e.target.value })} /></div>
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
