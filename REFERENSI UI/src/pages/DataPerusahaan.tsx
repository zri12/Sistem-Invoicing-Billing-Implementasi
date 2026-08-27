import { useState } from "react";
import { Upload, Save } from "lucide-react";
import DevspaceLogo from "@/components/DevspaceLogo";

interface Props {
  isReadOnly: boolean;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function DataPerusahaan({ isReadOnly, addToast }: Props) {
  const [form, setForm] = useState({
    namaPerusahaan: "PT. Ruang Kreasi Aplikasi",
    kodePerusahaan: "RKA",
    alamat: "Jl. Melong No.123, Cimahi, Jawa Barat 40534",
    telepon: "(022) 12345678",
    email: "info@ruangkreasi.co.id",
    website: "www.ruangkreasi.co.id",
    bank: "BCA",
    nomorRekening: "1394 5494 63",
    atasNama: "Ruang Kreasi Aplikasi PT",
    namaPenandatangan: "Andri Firmansyah",
    jabatan: "Admin Keuangan",
  });

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="p-6 w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Data Perusahaan</h1>
          <p className="text-sm text-[#667085] mt-0.5">Informasi perusahaan yang ditampilkan pada invoice.</p>
        </div>
        {!isReadOnly && (
          <button onClick={() => addToast("Perubahan berhasil disimpan.")} className="btn-primary flex items-center gap-2">
            <Save size={14} /> Simpan Perubahan
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Logo */}
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
          <h3 className="text-sm font-semibold text-[#172033] mb-4">Logo Perusahaan</h3>
          <div className="flex items-center gap-5">
            <div className="w-28 h-20 border border-[#E2E6EC] rounded-lg bg-[#F9FAFB] flex items-center justify-center">
              <DevspaceLogo size={36} withText={false} />
            </div>
            {!isReadOnly && (
              <div>
              <button onClick={() => addToast("Simulasi unggah file logo berhasil dipilih.", "info")} className="border-2 border-dashed border-[#E2E6EC] rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 w-48">
                <Upload size={18} className="mx-auto text-[#9CA3AF] mb-2" />
                <div className="text-xs text-[#667085]">Klik atau drag file logo</div>
                <div className="text-[11px] text-[#9CA3AF] mt-1">PNG, JPG max 2MB</div>
              </button>
              </div>
            )}
          </div>
        </div>

        {/* Identitas */}
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
          <h3 className="text-sm font-semibold text-[#172033] mb-4">Identitas Perusahaan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Nama Perusahaan</label>
              <input className="input w-full" value={form.namaPerusahaan} onChange={f("namaPerusahaan")} disabled={isReadOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Kode Perusahaan</label>
              <input className="input w-full" value={form.kodePerusahaan} onChange={f("kodePerusahaan")} disabled={isReadOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Nomor Telepon</label>
              <input className="input w-full" value={form.telepon} onChange={f("telepon")} disabled={isReadOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Email</label>
              <input className="input w-full" value={form.email} onChange={f("email")} disabled={isReadOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Website</label>
              <input className="input w-full" value={form.website} onChange={f("website")} disabled={isReadOnly} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Alamat</label>
              <textarea className="input w-full h-16 resize-none" value={form.alamat} onChange={f("alamat")} disabled={isReadOnly} />
            </div>
          </div>
        </div>

        {/* Rekening */}
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
          <h3 className="text-sm font-semibold text-[#172033] mb-4">Informasi Pembayaran Utama</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Bank</label>
              <input className="input w-full" value={form.bank} onChange={f("bank")} disabled={isReadOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Nomor Rekening</label>
              <input className="input w-full font-mono" value={form.nomorRekening} onChange={f("nomorRekening")} disabled={isReadOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Atas Nama</label>
              <input className="input w-full" value={form.atasNama} onChange={f("atasNama")} disabled={isReadOnly} />
            </div>
          </div>
        </div>

        {/* Dokumen */}
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
          <h3 className="text-sm font-semibold text-[#172033] mb-4">Dokumen & Tanda Tangan</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-2">Cap Perusahaan</label>
              {isReadOnly ? (
                <div className="w-28 h-28 rounded-full flex items-center justify-center bg-[#F9FAFB] border border-[#E2E6EC]" aria-label="Cap perusahaan">
                  <div className="w-20 h-20 rounded-full border-2 border-[#1E3A6E] text-[#1E3A6E] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold">DEVSPACE</span><span className="text-[8px]">PT. RKA</span>
                  </div>
                </div>
              ) : (
                <button onClick={() => addToast("Simulasi unggah cap perusahaan berhasil dipilih.", "info")} className="w-28 h-28 border-2 border-dashed border-[#E2E6EC] rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <div className="text-center"><Upload size={18} className="mx-auto text-[#9CA3AF] mb-1" /><div className="text-[11px] text-[#9CA3AF]">Upload Cap</div></div>
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-2">Tanda Tangan</label>
              {isReadOnly ? (
                <div className="w-40 h-20 rounded-lg flex items-center justify-center bg-[#F9FAFB] border border-[#E2E6EC]" aria-label="Tanda tangan">
                  <svg width="116" height="42" viewBox="0 0 116 42"><path d="M7 31 C20 7, 31 36, 45 22 C55 12, 63 31, 75 22 C85 15, 93 29, 108 17" fill="none" stroke="#172033" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </div>
              ) : (
                <button onClick={() => addToast("Simulasi unggah tanda tangan berhasil dipilih.", "info")} className="w-40 h-20 border-2 border-dashed border-[#E2E6EC] rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <div className="text-center"><Upload size={18} className="mx-auto text-[#9CA3AF] mb-1" /><div className="text-[11px] text-[#9CA3AF]">Upload TTD</div></div>
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Nama Penanda Tangan</label>
              <input className="input w-full" value={form.namaPenandatangan} onChange={f("namaPenandatangan")} disabled={isReadOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Jabatan</label>
              <input className="input w-full" value={form.jabatan} onChange={f("jabatan")} disabled={isReadOnly} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
