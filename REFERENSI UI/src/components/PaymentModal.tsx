import { useState } from "react";
import { REKENING, formatRupiah, type Invoice, type Pembayaran, type Pemasukan } from "@/data/mock";
import Modal from "@/components/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  totalAlreadyPaid: number;
  onSave: (payment: Pembayaran, pemasukan: Pemasukan) => void;
}

export default function PaymentModal({ open, onClose, invoice, totalAlreadyPaid, onSave }: Props) {
  const sisaTagihan = invoice.total - totalAlreadyPaid;
  const defaultRek = REKENING.find(r => r.id === invoice.rekeningId && r.status === "aktif") ?? REKENING.find(r => r.status === "aktif");

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    nominal: "",
    metode: "Transfer Bank",
    rekeningId: defaultRek?.id ?? "r1",
    referensi: "",
    catatan: "",
  });
  const [error, setError] = useState("");
  const [proofFile, setProofFile] = useState("");

  const handleSave = () => {
    const nominal = Number(form.nominal) || 0;
    if (nominal <= 0) {
      setError("Nominal pembayaran harus lebih dari Rp 0.");
      return;
    }
    if (nominal > sisaTagihan) {
      setError("Nominal pembayaran melebihi sisa tagihan.");
      return;
    }
    const rek = REKENING.find(r => r.id === form.rekeningId);
    const payment: Pembayaran = {
      id: "pay" + Date.now(),
      invoiceId: invoice.id,
      nomorInvoice: invoice.nomorInvoice,
      klienNama: invoice.klienNama,
      tanggal: form.tanggal,
      nominal,
      metode: form.metode,
      rekeningId: form.rekeningId,
      rekeningNama: rek?.namaBankKas ?? "BCA",
      referensi: form.referensi,
      catatan: form.catatan,
    };
    const pemasukan: Pemasukan = {
      id: "pm" + Date.now(),
      tanggal: form.tanggal,
      sumber: "Invoice",
      kategori: "Pendapatan Jasa",
      keterangan: invoice.namaInvoice + " — Pembayaran Invoice",
      referensiInvoice: invoice.nomorInvoice,
      rekeningId: form.rekeningId,
      rekeningNama: rek?.namaBankKas ?? "BCA",
      nominal,
    };
    onSave(payment, pemasukan);
    onClose();
    setError("");
    setProofFile("");
    setForm({
      tanggal: new Date().toISOString().split("T")[0],
      nominal: "",
      metode: "Transfer Bank",
      rekeningId: defaultRek?.id ?? "r1",
      referensi: "",
      catatan: "",
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat Pembayaran"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Batal</button>
          <button onClick={handleSave} className="btn-primary" disabled={sisaTagihan <= 0}>
            Simpan Pembayaran
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-[#F9FAFB] rounded-md p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#667085]">Invoice</span>
            <span className="font-medium text-[#172033]">{invoice.nomorInvoice}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[#667085]">Klien</span>
            <span className="text-[#172033]">{invoice.klienNama}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[#667085]">Sisa Tagihan</span>
            <span className="font-bold text-[#D97706]">{formatRupiah(sisaTagihan)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Tanggal Pembayaran <span className="text-red-500">*</span></label>
            <input type="date" className="input w-full" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Nominal (Rp) <span className="text-red-500">*</span></label>
            <input
              type="number"
              className="input w-full"
              value={form.nominal}
              onChange={e => setForm({ ...form, nominal: e.target.value })}
              placeholder="0"
              max={sisaTagihan}
            />
          </div>
        </div>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-[#172033] mb-1.5">Metode Pembayaran</label>
          <select className="input w-full" value={form.metode} onChange={e => setForm({ ...form, metode: e.target.value })}>
            <option>Transfer Bank</option>
            <option>Kas</option>
            <option>Cek</option>
            <option>QRIS</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#172033] mb-1.5">Rekening Tujuan</label>
          <select className="input w-full" value={form.rekeningId} onChange={e => setForm({ ...form, rekeningId: e.target.value })}>
            {REKENING.filter(r => r.status === "aktif").map(r => (
              <option key={r.id} value={r.id}>{r.namaBankKas} — {r.nomorRekening}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#172033] mb-1.5">Nomor Referensi</label>
          <input
            className="input w-full"
            value={form.referensi}
            onChange={e => setForm({ ...form, referensi: e.target.value })}
            placeholder="Nomor transfer / referensi bukti"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#172033] mb-1.5">Bukti Pembayaran</label>
          <input id="payment-proof" type="file" accept=".jpg,.jpeg,.png,.pdf" className="sr-only" onChange={e => setProofFile(e.target.files?.[0]?.name ?? "")} />
          <label htmlFor="payment-proof" className="block border-2 border-dashed border-[#E2E6EC] rounded-md p-3 text-center cursor-pointer hover:bg-gray-50">
            <span className="text-xs text-[#9CA3AF]">{proofFile || "Klik untuk unggah bukti pembayaran (JPG, PDF, PNG)"}</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#172033] mb-1.5">Catatan</label>
          <textarea
            className="input w-full h-16 resize-none"
            value={form.catatan}
            onChange={e => setForm({ ...form, catatan: e.target.value })}
            placeholder="Catatan tambahan (opsional)"
          />
        </div>
      </div>
    </Modal>
  );
}
