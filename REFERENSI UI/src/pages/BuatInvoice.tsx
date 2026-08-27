import { useState } from "react";
import { Plus, Trash2, ChevronLeft, Info } from "lucide-react";
import { KLIEN, PRODUK, REKENING, formatRupiah, generateInvoiceNumber, type Invoice } from "@/data/mock";
import type { Page } from "@/App";

interface LineItem {
  id: string;
  produk: string;
  deskripsi: string;
  harga: number;
  qty: number;
}

interface Props {
  invoice?: Invoice;
  invoices: Invoice[];
  onNavigate: (page: Page, id?: string) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  onSaveInvoice: (invoice: Invoice, message: string) => void;
}

export default function BuatInvoice({ invoice, invoices, onNavigate, addToast, onSaveInvoice }: Props) {
  const isEdit = Boolean(invoice);
  const [namaInvoice, setNamaInvoice] = useState(invoice?.namaInvoice ?? "");
  const [klienId, setKlienId] = useState(invoice?.klienId ?? "k1");
  const [tanggal, setTanggal] = useState(invoice?.tanggalInvoice ?? "2026-08-25");
  const [jatuhTempo, setJatuhTempo] = useState(invoice?.tanggalJatuhTempo ?? "2026-09-25");
  const [rekeningId, setRekeningId] = useState(invoice?.rekeningId ?? "r1");
  const [catatanPembayaran, setCatatanPembayaran] = useState(invoice?.catatanPembayaran ?? "");
  const [catatanInvoice, setCatatanInvoice] = useState(invoice?.catatanInvoice ?? "");
  const [diskon, setDiskon] = useState(invoice?.diskon ?? 0);
  const [items, setItems] = useState<LineItem[]>([
    ...(invoice?.items.map(item => ({ id: item.id, produk: item.produkLayanan, deskripsi: item.deskripsi, harga: item.harga, qty: item.qty })) ?? [{ id: "1", produk: "", deskripsi: "", harga: 0, qty: 1 }])
  ]);

  const klienSelected = KLIEN.find(k => k.id === klienId);
  const subtotal = items.reduce((s, i) => s + i.harga * i.qty, 0);
  const total = subtotal - diskon;
  const nomorInvoice = invoice?.nomorInvoice ?? generateInvoiceNumber(invoices, tanggal);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), produk: "", deskripsi: "", harga: 0, qty: 1 }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (field === "produk") {
        const p = PRODUK.find(p => p.nama === value);
        return { ...i, produk: value as string, harga: p ? p.harga : i.harga, deskripsi: p ? p.deskripsi : i.deskripsi };
      }
      return { ...i, [field]: value };
    }));
  };

  const handleSave = (asDraft: boolean, preview = false) => {
    if (!namaInvoice.trim() || !klienSelected || items.some(item => !item.deskripsi.trim() || item.harga <= 0 || item.qty <= 0)) {
      addToast("Lengkapi nama invoice dan semua rincian item terlebih dahulu.", "error");
      return;
    }
    if (invoices.some(existing => existing.id !== invoice?.id && existing.nomorInvoice === nomorInvoice)) {
      addToast("Nomor invoice sudah digunakan. Silakan periksa kembali data invoice.", "error");
      return;
    }
    const statusDokumen = invoice ? invoice.statusDokumen : asDraft ? "draft" : "diterbitkan";
    const savedInvoice: Invoice = {
      id: invoice?.id ?? `inv-${Date.now()}`,
      nomorInvoice,
      namaInvoice: namaInvoice.trim(),
      klienId,
      klienNama: klienSelected.nama,
      tanggalInvoice: tanggal,
      tanggalJatuhTempo: jatuhTempo,
      items: items.map(item => ({ id: item.id, produkLayanan: item.produk || "Layanan", deskripsi: item.deskripsi, harga: item.harga, qty: item.qty, total: item.harga * item.qty })),
      subtotal,
      diskon: Math.min(Math.max(0, diskon), subtotal),
      total: Math.max(0, total),
      rekeningId,
      catatanPembayaran,
      catatanInvoice,
      statusDokumen,
      statusPembayaran: invoice?.statusPembayaran ?? "belum_dibayar",
    };
    const message = preview ? "Preview invoice dibuka." : asDraft ? "Invoice berhasil disimpan sebagai draft." : isEdit ? "Perubahan invoice berhasil disimpan." : "Invoice berhasil diterbitkan.";
    onSaveInvoice(savedInvoice, message);
    onNavigate(preview ? "preview-invoice" : "invoice", preview ? savedInvoice.id : undefined);
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => onNavigate("invoice")} className="p-1.5 rounded hover:bg-gray-200 text-[#667085]">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-[#172033]">{isEdit ? "Edit Invoice" : "Buat Invoice Baru"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isEdit && <button onClick={() => handleSave(true)} className="btn-secondary">Simpan Draft</button>}
          <button onClick={() => handleSave(true, true)} className="btn-secondary">Preview</button>
          <button onClick={() => handleSave(false)} className="btn-primary">{isEdit ? "Simpan Perubahan" : "Simpan & Terbitkan"}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Section 1: Klien */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-sm font-semibold text-[#172033] mb-4">Data Klien</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Pilih Klien <span className="text-red-500">*</span></label>
              <select className="input w-full" value={klienId} onChange={e => setKlienId(e.target.value)}>
                {KLIEN.filter(k => k.status === "aktif").map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
            {klienSelected && (
              <div className="bg-[#F9FAFB] rounded-md p-3 text-sm space-y-1">
                <div className="font-medium text-[#172033]">{klienSelected.nama}</div>
                <div className="text-[#667085]">PIC: {klienSelected.pic}</div>
                <div className="text-[#667085]">{klienSelected.alamat}</div>
                <div className="text-[#667085]">Tel: {klienSelected.telepon} &bull; {klienSelected.email}</div>
              </div>
            )}
          </div>

          {/* Section 2: Informasi Invoice */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-sm font-semibold text-[#172033] mb-4">Informasi Invoice</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Nama Invoice <span className="text-red-500">*</span></label>
                <input className="input w-full" value={namaInvoice} onChange={e => setNamaInvoice(e.target.value)} placeholder="Nama / keterangan invoice" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Nomor Invoice</label>
                <div className="relative">
                  <input className="input w-full bg-gray-50 text-[#667085] pr-8" value={nomorInvoice} readOnly />
                  <Info size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1">Dibuat otomatis oleh sistem</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Tanggal Invoice <span className="text-red-500">*</span></label>
                <input type="date" className="input w-full" value={tanggal} onChange={e => setTanggal(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Tanggal Jatuh Tempo <span className="text-red-500">*</span></label>
                <input type="date" className="input w-full" value={jatuhTempo} onChange={e => setJatuhTempo(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3: Rincian Item */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-sm font-semibold text-[#172033] mb-4">Rincian Item</h3>
            <table className="w-full mb-3">
              <thead>
                <tr className="border-b border-[#E2E6EC]">
                  <th className="text-left pb-2 text-xs font-medium text-[#667085] w-40">Produk / Layanan</th>
                  <th className="text-left pb-2 text-xs font-medium text-[#667085] pl-3">Deskripsi</th>
                  <th className="text-right pb-2 text-xs font-medium text-[#667085] w-28 pl-3">Harga</th>
                  <th className="text-center pb-2 text-xs font-medium text-[#667085] w-16 pl-3">Qty</th>
                  <th className="text-right pb-2 text-xs font-medium text-[#667085] w-28 pl-3">Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#F3F4F6]">
                    <td className="py-2.5 pr-2">
                      <select className="input w-full text-xs" value={item.produk} onChange={e => updateItem(item.id, "produk", e.target.value)}>
                        <option value="">Pilih produk...</option>
                        {PRODUK.filter(p => p.status === "aktif").map(p => (
                          <option key={p.id} value={p.nama}>{p.nama}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 pl-3 pr-2">
                      <input className="input w-full text-xs" value={item.deskripsi} onChange={e => updateItem(item.id, "deskripsi", e.target.value)} placeholder="Keterangan item" />
                    </td>
                    <td className="py-2.5 pl-3 pr-2">
                      <input type="number" className="input w-full text-xs text-right" value={item.harga || ""} onChange={e => updateItem(item.id, "harga", Number(e.target.value))} placeholder="0" />
                    </td>
                    <td className="py-2.5 pl-3 pr-2">
                      <input type="number" className="input w-full text-xs text-center" value={item.qty} min={1} onChange={e => updateItem(item.id, "qty", Number(e.target.value))} />
                    </td>
                    <td className="py-2.5 pl-3 pr-2 text-right text-sm font-medium text-[#172033]">
                      {formatRupiah(item.harga * item.qty)}
                    </td>
                    <td className="py-2.5 pl-2">
                      <button onClick={() => removeItem(item.id)} className="p-1 text-[#9CA3AF] hover:text-red-500 rounded disabled:opacity-30" disabled={items.length === 1}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-[#315DA8] hover:text-[#173B6C] font-medium">
              <Plus size={14} /> Tambah Item
            </button>
          </div>

          {/* Section 4: Informasi Pembayaran */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-sm font-semibold text-[#172033] mb-4">Informasi Pembayaran</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Rekening Pembayaran</label>
                <select className="input w-full" value={rekeningId} onChange={e => setRekeningId(e.target.value)}>
                  {REKENING.filter(r => r.status === "aktif").map(r => (
                    <option key={r.id} value={r.id}>{r.namaBankKas} — {r.nomorRekening} a/n {r.atasNama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Catatan Pembayaran / Terms & Conditions</label>
                <textarea className="input w-full h-20 resize-none" value={catatanPembayaran} onChange={e => setCatatanPembayaran(e.target.value)} placeholder="Syarat dan ketentuan pembayaran..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Catatan Invoice</label>
                <textarea className="input w-full h-16 resize-none" value={catatanInvoice} onChange={e => setCatatanInvoice(e.target.value)} placeholder="Catatan tambahan untuk invoice..." />
              </div>
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5 sticky top-6">
            <h3 className="text-sm font-semibold text-[#172033] mb-4">Ringkasan</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#667085]">Subtotal</span>
                <span className="text-[#172033] font-medium">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#667085]">Diskon</span>
                <input
                  type="number"
                  className="w-32 h-8 px-2 text-sm text-right border border-[#E2E6EC] rounded focus:outline-none focus:border-[#173B6C]"
                  value={diskon || ""}
                  onChange={e => setDiskon(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="border-t border-[#E2E6EC] pt-3 flex justify-between">
                <span className="text-sm font-semibold text-[#172033]">Total Due</span>
                <span className="text-lg font-bold text-[#173B6C]">{formatRupiah(total)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <button onClick={() => handleSave(false)} className="btn-primary w-full">{isEdit ? "Simpan Perubahan" : "Simpan & Terbitkan"}</button>
              {!isEdit && <button onClick={() => handleSave(true)} className="btn-secondary w-full">Simpan Draft</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
