import { useState } from "react";
import { Save } from "lucide-react";

interface Props {
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function PenomoranInvoice({ addToast }: Props) {
  const [nomorAwal, setNomorAwal] = useState("001");
  const [kodeDokumen, setKodeDokumen] = useState("INV");
  const [kodePerusahaan, setKodePerusahaan] = useState("RKA");
  const [formatBulan, setFormatBulan] = useState("romawi");
  const [formatTahun, setFormatTahun] = useState("2digit");
  const [resetPer, setResetPer] = useState("belum");

  const now = new Date();
  const bulanRomawi = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const bulanAngka = String(now.getMonth() + 1).padStart(2, "0");
  const tahun2d = String(now.getFullYear()).slice(-2);
  const tahun4d = String(now.getFullYear());

  const bulanStr = formatBulan === "romawi" ? bulanRomawi[now.getMonth()] : bulanAngka;
  const tahunStr = formatTahun === "2digit" ? tahun2d : tahun4d;

  const preview = `${nomorAwal}/${kodeDokumen}/${kodePerusahaan}/${bulanStr}/${tahunStr}`;

  return (
    <div className="p-6 w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Penomoran Invoice</h1>
          <p className="text-sm text-[#667085] mt-0.5">Konfigurasi format nomor invoice yang dibuat otomatis.</p>
        </div>
        <button onClick={() => addToast("Konfigurasi penomoran berhasil disimpan.")} className="btn-primary flex items-center gap-2">
          <Save size={14} /> Simpan
        </button>
      </div>

      {/* Preview */}
      <div className="bg-[#EEF2F8] border border-[#C3D1E8] rounded-lg p-5 mb-6">
        <div className="text-xs text-[#315DA8] mb-2 font-medium">Preview Format Saat Ini</div>
        <div className="text-2xl font-bold text-[#173B6C] tracking-wider font-mono">{preview}</div>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { value: nomorAwal, label: "Nomor Urut" },
            { value: kodeDokumen, label: "Kode Dokumen" },
            { value: kodePerusahaan, label: "Kode Perusahaan" },
            { value: bulanStr, label: "Bulan" },
            { value: tahunStr, label: "Tahun" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs">
              <span className="bg-white border border-[#C3D1E8] rounded px-2 py-0.5 font-mono font-semibold text-[#173B6C]">{s.value}</span>
              <span className="text-[#667085]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
        <h3 className="text-sm font-semibold text-[#172033] mb-5">Konfigurasi Format</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Nomor Awal / Urutan</label>
              <input className="input w-full font-mono" value={nomorAwal} onChange={e => setNomorAwal(e.target.value)} placeholder="001" />
              <p className="text-xs text-[#9CA3AF] mt-1">Angka urut yang digunakan saat ini</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Kode Dokumen</label>
              <input className="input w-full font-mono" value={kodeDokumen} onChange={e => setKodeDokumen(e.target.value.toUpperCase())} placeholder="INV" />
              <p className="text-xs text-[#9CA3AF] mt-1">Contoh: INV, INVOICE, FAK</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Kode Perusahaan</label>
              <input className="input w-full font-mono" value={kodePerusahaan} onChange={e => setKodePerusahaan(e.target.value.toUpperCase())} placeholder="RKA" />
              <p className="text-xs text-[#9CA3AF] mt-1">Singkatan nama perusahaan</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Format Bulan</label>
              <select className="input w-full" value={formatBulan} onChange={e => setFormatBulan(e.target.value)}>
                <option value="romawi">Angka Romawi (VIII)</option>
                <option value="angka">Angka (08)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Format Tahun</label>
              <select className="input w-full" value={formatTahun} onChange={e => setFormatTahun(e.target.value)}>
                <option value="2digit">2 Digit (26)</option>
                <option value="4digit">4 Digit (2026)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Reset Urutan</label>
              <select className="input w-full" value={resetPer} onChange={e => setResetPer(e.target.value)}>
                <option value="belum">Belum Ditentukan</option>
                <option value="bulanan">Setiap Bulan</option>
                <option value="tahunan">Setiap Tahun</option>
                <option value="tidak">Tidak Direset</option>
              </select>
              <p className="text-xs text-[#9CA3AF] mt-1">Kapan nomor urut direset ke awal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="text-sm font-medium text-amber-800 mb-1">Catatan Penting</div>
        <div className="text-xs text-amber-700">Perubahan format penomoran hanya berlaku untuk invoice yang dibuat setelah disimpan. Invoice yang sudah ada tidak akan terpengaruh.</div>
      </div>
    </div>
  );
}
