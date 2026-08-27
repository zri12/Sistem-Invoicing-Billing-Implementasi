export type Role = "admin" | "manager";

export interface User {
  id: string;
  nama: string;
  email: string;
  username: string;
  role: Role;
  status: "aktif" | "nonaktif";
}

export interface Klien {
  id: string;
  nama: string;
  pic: string;
  alamat: string;
  telepon: string;
  email: string;
  catatan: string;
  status: "aktif" | "nonaktif";
  jumlahInvoice: number;
}

export interface Vendor {
  id: string;
  nama: string;
  pic: string;
  alamat: string;
  telepon: string;
  email: string;
  catatan: string;
  status: "aktif" | "nonaktif";
  jumlahTransaksi: number;
}

export interface Produk {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  satuan: string;
  status: "aktif" | "nonaktif";
}

export interface Rekening {
  id: string;
  namaBankKas: string;
  nomorRekening: string;
  atasNama: string;
  saldo: number;
  status: "aktif" | "nonaktif";
}

export interface InvoiceItem {
  id: string;
  produkLayanan: string;
  deskripsi: string;
  harga: number;
  qty: number;
  total: number;
}

export type StatusDokumen = "draft" | "diterbitkan" | "dibatalkan";
export type StatusPembayaran = "belum_dibayar" | "dibayar_sebagian" | "lunas" | "jatuh_tempo";

export interface Invoice {
  id: string;
  nomorInvoice: string;
  namaInvoice: string;
  klienId: string;
  klienNama: string;
  tanggalInvoice: string;
  tanggalJatuhTempo: string;
  items: InvoiceItem[];
  subtotal: number;
  diskon: number;
  total: number;
  rekeningId: string;
  catatanPembayaran: string;
  catatanInvoice: string;
  statusDokumen: StatusDokumen;
  statusPembayaran: StatusPembayaran;
}

export interface Pembayaran {
  id: string;
  invoiceId: string;
  nomorInvoice: string;
  klienNama: string;
  tanggal: string;
  nominal: number;
  metode: string;
  rekeningId: string;
  rekeningNama: string;
  referensi: string;
  catatan: string;
}

export interface Pemasukan {
  id: string;
  tanggal: string;
  sumber: string;
  kategori: string;
  keterangan: string;
  referensiInvoice: string;
  rekeningId: string;
  rekeningNama: string;
  nominal: number;
}

export interface Pengeluaran {
  id: string;
  tanggal: string;
  vendorId: string;
  vendorNama: string;
  kategori: string;
  keterangan: string;
  rekeningId: string;
  rekeningNama: string;
  nominal: number;
  bukti: string;
  catatan: string;
}

export const USERS: User[] = [
  { id: "u1", nama: "Fazri Lukman", email: "fazri@ruangkreasi.co.id", username: "fazrilukman", role: "admin", status: "aktif" },
  { id: "u2", nama: "Fahmi Nashruddin", email: "fahmi@ruangkreasi.co.id", username: "fahminashruddin", role: "manager", status: "aktif" },
  { id: "u3", nama: "Budi Santoso", email: "budi@ruangkreasi.co.id", username: "budi.santoso", role: "admin", status: "aktif" },
  { id: "u4", nama: "Dewi Kusuma", email: "dewi@ruangkreasi.co.id", username: "dewi.kusuma", role: "manager", status: "nonaktif" },
];

export const KLIEN: Klien[] = [
  { id: "k1", nama: "Graha Indonesia Telekomunika", pic: "Budi Setiawan", alamat: "Jl. Kembar I No.53, Cigelereng, Regol, Kota Bandung, Jawa Barat 40253", telepon: "(022) 85240014", email: "budi.s@graha-indo.co.id", catatan: "Klien utama project Spiritra", status: "aktif", jumlahInvoice: 5 },
  { id: "k2", nama: "PT Maju Jaya Teknologi", pic: "Rini Wulandari", alamat: "Jl. Sudirman No.88, Jakarta Pusat", telepon: "021-5550182", email: "rini@majujaya.co.id", catatan: "", status: "aktif", jumlahInvoice: 3 },
  { id: "k3", nama: "CV Berkah Abadi Sentosa", pic: "Hendra Gunawan", alamat: "Jl. Braga No.12, Bandung", telepon: "022-4200991", email: "hendra@berkahsentosa.com", catatan: "Pembayaran sering terlambat", status: "aktif", jumlahInvoice: 8 },
  { id: "k4", nama: "PT Digital Nusantara", pic: "Anisa Putri", alamat: "Jl. Gatot Subroto No.45, Bandung", telepon: "022-7320055", email: "anisa@digitalnusantara.id", catatan: "", status: "aktif", jumlahInvoice: 2 },
  { id: "k5", nama: "Yayasan Pendidikan Harapan", pic: "Pak Soetrisno", alamat: "Jl. Ciateul No.7, Bandung", telepon: "022-5222111", email: "admin@harapan.org", catatan: "Klien lama sejak 2021", status: "nonaktif", jumlahInvoice: 1 },
];

export const VENDOR: Vendor[] = [
  { id: "v1", nama: "PT Sumber Daya Komputindo", pic: "Agus Salim", alamat: "Jl. Asia Afrika No.18, Bandung", telepon: "022-4232456", email: "agus@sdkomputindo.co.id", catatan: "Supplier hardware dan software", status: "aktif", jumlahTransaksi: 12 },
  { id: "v2", nama: "CV Mitra Cloud Solutions", pic: "Fitri Handayani", alamat: "Jl. Dipatiukur No.35, Bandung", telepon: "022-2512778", email: "fitri@mitracloud.id", catatan: "Hosting dan domain", status: "aktif", jumlahTransaksi: 24 },
  { id: "v3", nama: "PT Kreasi Media Utama", pic: "Dimas Prayoga", alamat: "Jl. Pajajaran No.99, Bogor", telepon: "0251-8320044", email: "dimas@kreasimedia.co.id", catatan: "", status: "aktif", jumlahTransaksi: 5 },
  { id: "v4", nama: "Toko Elektronik Sejati", pic: "Mama Rudi", alamat: "Pasar Baru, Bandung", telepon: "022-4203901", email: "", catatan: "Pembelian alat kantor", status: "nonaktif", jumlahTransaksi: 3 },
];

export const PRODUK: Produk[] = [
  { id: "p1", nama: "Pengembangan Website", deskripsi: "Jasa pembuatan website company profile / landing page", harga: 5000000, satuan: "project", status: "aktif" },
  { id: "p2", nama: "Pengembangan Aplikasi Mobile", deskripsi: "Jasa pembuatan aplikasi Android / iOS", harga: 15000000, satuan: "project", status: "aktif" },
  { id: "p3", nama: "UI/UX Design", deskripsi: "Desain antarmuka pengguna", harga: 3000000, satuan: "project", status: "aktif" },
  { id: "p4", nama: "Maintenance & Support", deskripsi: "Pemeliharaan dan dukungan teknis bulanan", harga: 1500000, satuan: "bulan", status: "aktif" },
  { id: "p5", nama: "Konsultasi IT", deskripsi: "Sesi konsultasi pengembangan sistem", harga: 500000, satuan: "sesi", status: "aktif" },
  { id: "p6", nama: "Cloud Infrastructure Setup", deskripsi: "Konfigurasi server dan infrastruktur cloud", harga: 4000000, satuan: "project", status: "nonaktif" },
];

export const REKENING: Rekening[] = [
  { id: "r1", namaBankKas: "BCA", nomorRekening: "1394 5494 63", atasNama: "Ruang Kreasi Aplikasi PT", saldo: 85000000, status: "aktif" },
  { id: "r2", namaBankKas: "Mandiri", nomorRekening: "131 000 7654 321", atasNama: "PT Ruang Kreasi Aplikasi", saldo: 32500000, status: "aktif" },
  { id: "r3", namaBankKas: "Kas Kantor", nomorRekening: "-", atasNama: "-", saldo: 5000000, status: "aktif" },
  { id: "r4", namaBankKas: "BNI", nomorRekening: "0988 1234 567", atasNama: "Ruang Kreasi Aplikasi PT", saldo: 12000000, status: "nonaktif" },
];

export const INVOICES: Invoice[] = [
  {
    id: "inv1", nomorInvoice: "001/INV/RKA/VIII/26", namaInvoice: "Project Spiritra",
    klienId: "k1", klienNama: "Graha Indonesia Telekomunika",
    tanggalInvoice: "2026-08-01", tanggalJatuhTempo: "2026-08-15",
    items: [{ id: "i1", produkLayanan: "Pengembangan Website", deskripsi: "Pembayaran Ke-2 Pelunasan Project Spiritra", harga: 3000000, qty: 1, total: 3000000 }],
    subtotal: 3000000, diskon: 0, total: 3000000,
    rekeningId: "r1", catatanPembayaran: "BCA 1394 5494 63\nRuang Kreasi Aplikasi PT\nKCP Cimahi",
    catatanInvoice: "Silakan lakukan pembayaran ke rekening yang tertera di atas",
    statusDokumen: "diterbitkan", statusPembayaran: "lunas"
  },
  {
    id: "inv2", nomorInvoice: "002/INV/RKA/VIII/26", namaInvoice: "Aplikasi Mobile MJT",
    klienId: "k2", klienNama: "PT Maju Jaya Teknologi",
    tanggalInvoice: "2026-08-05", tanggalJatuhTempo: "2026-08-20",
    items: [
      { id: "i2", produkLayanan: "Pengembangan Aplikasi Mobile", deskripsi: "Tahap 1 - Analisis & Desain", harga: 7500000, qty: 1, total: 7500000 },
      { id: "i3", produkLayanan: "UI/UX Design", deskripsi: "Desain UI/UX Aplikasi", harga: 3000000, qty: 1, total: 3000000 },
    ],
    subtotal: 10500000, diskon: 500000, total: 10000000,
    rekeningId: "r1", catatanPembayaran: "BCA 1394 5494 63\nRuang Kreasi Aplikasi PT",
    catatanInvoice: "",
    statusDokumen: "diterbitkan", statusPembayaran: "dibayar_sebagian"
  },
  {
    id: "inv3", nomorInvoice: "003/INV/RKA/VIII/26", namaInvoice: "Maintenance Agustus - BAS",
    klienId: "k3", klienNama: "CV Berkah Abadi Sentosa",
    tanggalInvoice: "2026-08-01", tanggalJatuhTempo: "2026-08-10",
    items: [{ id: "i4", produkLayanan: "Maintenance & Support", deskripsi: "Maintenance bulan Agustus 2026", harga: 1500000, qty: 1, total: 1500000 }],
    subtotal: 1500000, diskon: 0, total: 1500000,
    rekeningId: "r2", catatanPembayaran: "",
    catatanInvoice: "",
    statusDokumen: "diterbitkan", statusPembayaran: "jatuh_tempo"
  },
  {
    id: "inv4", nomorInvoice: "004/INV/RKA/VIII/26", namaInvoice: "Website PT Digital Nusantara",
    klienId: "k4", klienNama: "PT Digital Nusantara",
    tanggalInvoice: "2026-08-10", tanggalJatuhTempo: "2026-09-10",
    items: [
      { id: "i5", produkLayanan: "Pengembangan Website", deskripsi: "Website Company Profile", harga: 5000000, qty: 1, total: 5000000 },
    ],
    subtotal: 5000000, diskon: 0, total: 5000000,
    rekeningId: "r1", catatanPembayaran: "",
    catatanInvoice: "",
    statusDokumen: "draft", statusPembayaran: "belum_dibayar"
  },
  {
    id: "inv5", nomorInvoice: "005/INV/RKA/VII/26", namaInvoice: "Konsultasi IT - BAS",
    klienId: "k3", klienNama: "CV Berkah Abadi Sentosa",
    tanggalInvoice: "2026-07-15", tanggalJatuhTempo: "2026-07-30",
    items: [{ id: "i6", produkLayanan: "Konsultasi IT", deskripsi: "3 sesi konsultasi pengembangan sistem", harga: 500000, qty: 3, total: 1500000 }],
    subtotal: 1500000, diskon: 0, total: 1500000,
    rekeningId: "r2", catatanPembayaran: "",
    catatanInvoice: "",
    statusDokumen: "dibatalkan", statusPembayaran: "belum_dibayar"
  },
];

export const PEMBAYARAN: Pembayaran[] = [
  { id: "pay1", invoiceId: "inv1", nomorInvoice: "001/INV/RKA/VIII/26", klienNama: "Graha Indonesia Telekomunika", tanggal: "2026-08-12", nominal: 3000000, metode: "Transfer Bank", rekeningId: "r1", rekeningNama: "BCA", referensi: "TRF-20260812-001", catatan: "Pelunasan invoice" },
  { id: "pay2", invoiceId: "inv2", nomorInvoice: "002/INV/RKA/VIII/26", klienNama: "PT Maju Jaya Teknologi", tanggal: "2026-08-18", nominal: 5000000, metode: "Transfer Bank", rekeningId: "r1", rekeningNama: "BCA", referensi: "TRF-20260818-002", catatan: "Pembayaran DP" },
  { id: "pay3", invoiceId: "inv3", nomorInvoice: "003/INV/RKA/VIII/26", klienNama: "CV Berkah Abadi Sentosa", tanggal: "", nominal: 0, metode: "", rekeningId: "", rekeningNama: "", referensi: "", catatan: "" },
];

export const PEMASUKAN: Pemasukan[] = [
  { id: "pm1", tanggal: "2026-08-12", sumber: "Invoice", kategori: "Pendapatan Jasa", keterangan: "Project Spiritra - Pelunasan", referensiInvoice: "001/INV/RKA/VIII/26", rekeningId: "r1", rekeningNama: "BCA", nominal: 3000000 },
  { id: "pm2", tanggal: "2026-08-18", sumber: "Invoice", kategori: "Pendapatan Jasa", keterangan: "Aplikasi Mobile MJT - DP", referensiInvoice: "002/INV/RKA/VIII/26", rekeningId: "r1", rekeningNama: "BCA", nominal: 5000000 },
  { id: "pm3", tanggal: "2026-08-05", sumber: "Lain-lain", kategori: "Pendapatan Lainnya", keterangan: "Reimbursement biaya perjalanan dinas", referensiInvoice: "", rekeningId: "r3", rekeningNama: "Kas Kantor", nominal: 350000 },
  { id: "pm4", tanggal: "2026-07-28", sumber: "Invoice", kategori: "Pendapatan Jasa", keterangan: "Maintenance Juli - BAS", referensiInvoice: "003/INV/RKA/VII/26", rekeningId: "r2", rekeningNama: "Mandiri", nominal: 1500000 },
];

export const PENGELUARAN: Pengeluaran[] = [
  { id: "pe1", tanggal: "2026-08-02", vendorId: "v2", vendorNama: "CV Mitra Cloud Solutions", kategori: "Infrastruktur", keterangan: "Biaya hosting server Agustus", rekeningId: "r1", rekeningNama: "BCA", nominal: 850000, bukti: "bukti1.jpg", catatan: "" },
  { id: "pe2", tanggal: "2026-08-05", vendorId: "v1", vendorNama: "PT Sumber Daya Komputindo", kategori: "Peralatan", keterangan: "Pembelian SSD laptop developer", rekeningId: "r1", rekeningNama: "BCA", nominal: 1200000, bukti: "bukti2.jpg", catatan: "SSD 512GB Samsung" },
  { id: "pe3", tanggal: "2026-08-10", vendorId: "", vendorNama: "-", kategori: "Operasional", keterangan: "Biaya listrik dan internet kantor", rekeningId: "r3", rekeningNama: "Kas Kantor", nominal: 750000, bukti: "", catatan: "" },
  { id: "pe4", tanggal: "2026-08-15", vendorId: "v3", vendorNama: "PT Kreasi Media Utama", kategori: "Marketing", keterangan: "Desain materi presentasi klien", rekeningId: "r2", rekeningNama: "Mandiri", nominal: 500000, bukti: "", catatan: "" },
  { id: "pe5", tanggal: "2026-07-25", vendorId: "v2", vendorNama: "CV Mitra Cloud Solutions", kategori: "Infrastruktur", keterangan: "Biaya hosting server Juli", rekeningId: "r1", rekeningNama: "BCA", nominal: 850000, bukti: "bukti5.jpg", catatan: "" },
];

export const formatRupiah = (num: number) => {
  return "Rp " + num.toLocaleString("id-ID");
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateLong = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/** Menjaga status pembayaran konsisten di seluruh layar prototype. */
export const getPaymentSummary = (invoice: Invoice, payments: Pembayaran[]) => {
  const totalPembayaran = payments
    .filter(payment => payment.invoiceId === invoice.id)
    .reduce((total, payment) => total + payment.nominal, 0);
  const sisaTagihan = Math.max(0, invoice.total - totalPembayaran);
  const today = new Date().toISOString().slice(0, 10);
  const statusPembayaran: StatusPembayaran = totalPembayaran >= invoice.total
    ? "lunas"
    : sisaTagihan > 0 && invoice.tanggalJatuhTempo < today
      ? "jatuh_tempo"
      : totalPembayaran > 0
        ? "dibayar_sebagian"
        : "belum_dibayar";

  return { totalPembayaran, sisaTagihan, statusPembayaran };
};

const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** Membuat nomor invoice berikutnya dari data invoice runtime yang sudah ada. */
export const generateInvoiceNumber = (invoices: Invoice[], tanggalInvoice: string) => {
  const highestSequence = invoices.reduce((highest, invoice) => {
    const sequence = Number.parseInt(invoice.nomorInvoice.split("/")[0] ?? "", 10);
    return Number.isFinite(sequence) ? Math.max(highest, sequence) : highest;
  }, 0);
  const invoiceDate = new Date(`${tanggalInvoice}T00:00:00`);
  const month = ROMAN_MONTHS[invoiceDate.getMonth()] ?? "I";
  const year = String(invoiceDate.getFullYear()).slice(-2);
  return `${String(highestSequence + 1).padStart(3, "0")}/INV/RKA/${month}/${year}`;
};
