import { Building2, CreditCard, Package, Users } from 'lucide-vue-next';

const clients = [
    { id: 'k1', nama: 'Graha Indonesia Telekomunika', pic: 'Budi Setiawan', alamat: 'Jl. Kembar I No.53, Bandung', telepon: '(022) 85240014', email: 'budi.s@graha-indo.co.id', catatan: 'Klien utama project Spiritra', status: 'aktif', jumlah: 5 },
    { id: 'k2', nama: 'PT Maju Jaya Teknologi', pic: 'Rini Wulandari', alamat: 'Jl. Sudirman No.88, Jakarta Pusat', telepon: '021-5550182', email: 'rini@majujaya.co.id', catatan: '', status: 'aktif', jumlah: 3 },
    { id: 'k3', nama: 'CV Berkah Abadi Sentosa', pic: 'Hendra Gunawan', alamat: 'Jl. Braga No.12, Bandung', telepon: '022-4200991', email: 'hendra@berkahsentosa.com', catatan: 'Pembayaran sering terlambat', status: 'aktif', jumlah: 8 },
    { id: 'k4', nama: 'PT Digital Nusantara', pic: 'Anisa Putri', alamat: 'Jl. Gatot Subroto No.45, Bandung', telepon: '022-7320055', email: 'anisa@digitalnusantara.id', catatan: '', status: 'aktif', jumlah: 2 },
    { id: 'k5', nama: 'Yayasan Pendidikan Harapan', pic: 'Pak Soetrisno', alamat: 'Jl. Ciateul No.7, Bandung', telepon: '022-5222111', email: 'admin@harapan.org', catatan: 'Klien lama sejak 2021', status: 'nonaktif', jumlah: 1 },
    { id: 'k6', nama: 'PT Cakra Data Persada', pic: 'Nadia Pratama', alamat: 'Jl. Asia Afrika No. 12, Bandung', telepon: '022-4014321', email: 'nadia@cakradata.co.id', catatan: '', status: 'aktif', jumlah: 4 },
];

const vendors = [
    { id: 'v1', nama: 'PT Sumber Daya Komputindo', pic: 'Agus Salim', alamat: 'Jl. Asia Afrika No.18, Bandung', telepon: '022-4232456', email: 'agus@sdkomputindo.co.id', status: 'aktif', jumlah: 12 },
    { id: 'v2', nama: 'CV Mitra Cloud Solutions', pic: 'Fitri Handayani', alamat: 'Jl. Dipatiukur No.35, Bandung', telepon: '022-2512778', email: 'fitri@mitracloud.id', status: 'aktif', jumlah: 24 },
    { id: 'v3', nama: 'PT Kreasi Media Utama', pic: 'Dimas Prayoga', alamat: 'Jl. Pajajaran No.99, Bogor', telepon: '0251-8320044', email: 'dimas@kreasimedia.co.id', status: 'aktif', jumlah: 5 },
    { id: 'v4', nama: 'Toko Elektronik Sejati', pic: 'Mama Rudi', alamat: 'Pasar Baru, Bandung', telepon: '022-4203901', email: '', status: 'nonaktif', jumlah: 3 },
    { id: 'v5', nama: 'CV Bandung Print Studio', pic: 'Raka Aditya', alamat: 'Jl. Cihampelas No. 90, Bandung', telepon: '022-7134400', email: 'raka@bandungprint.id', status: 'aktif', jumlah: 7 },
    { id: 'v6', nama: 'PT Jaringan Nusantara', pic: 'Nanda Saputra', alamat: 'Jl. Diponegoro No. 14, Bandung', telepon: '022-4220909', email: 'nanda@jaringannusantara.id', status: 'aktif', jumlah: 9 },
];

const products = [
    { id: 'p1', nama: 'Pengembangan Website', deskripsi: 'Jasa pembuatan website company profile / landing page', harga: 5000000, satuan: 'project', status: 'aktif' },
    { id: 'p2', nama: 'Pengembangan Aplikasi Mobile', deskripsi: 'Jasa pembuatan aplikasi Android / iOS', harga: 15000000, satuan: 'project', status: 'aktif' },
    { id: 'p3', nama: 'UI/UX Design', deskripsi: 'Desain antarmuka pengguna', harga: 3000000, satuan: 'project', status: 'aktif' },
    { id: 'p4', nama: 'Maintenance & Support', deskripsi: 'Pemeliharaan dan dukungan teknis bulanan', harga: 1500000, satuan: 'bulan', status: 'aktif' },
    { id: 'p5', nama: 'Konsultasi IT', deskripsi: 'Sesi konsultasi pengembangan sistem', harga: 500000, satuan: 'sesi', status: 'aktif' },
    { id: 'p6', nama: 'Cloud Infrastructure Setup', deskripsi: 'Konfigurasi server dan infrastruktur cloud', harga: 4000000, satuan: 'project', status: 'nonaktif' },
];

const accounts = [
    { id: 'r1', nama: 'BCA', nomor: '1394 5494 63', atasNama: 'Ruang Kreasi Aplikasi PT', cabang: '', status: 'aktif' },
    { id: 'r2', nama: 'Mandiri', nomor: '131 000 7654 321', atasNama: 'PT Ruang Kreasi Aplikasi', cabang: '', status: 'aktif' },
    { id: 'r3', nama: 'Kas Kantor', nomor: '-', atasNama: '-', cabang: '', status: 'aktif' },
    { id: 'r4', nama: 'BNI', nomor: '0988 1234 567', atasNama: 'Ruang Kreasi Aplikasi PT', cabang: '', status: 'nonaktif' },
    { id: 'r5', nama: 'BRI', nomor: '0078 0123 4567 89', atasNama: 'PT Ruang Kreasi Aplikasi', cabang: '', status: 'aktif' },
    { id: 'r6', nama: 'Kas Operasional', nomor: '-', atasNama: '-', cabang: '', status: 'aktif' },
];

export const masterDataSeed = { clients, vendors, products, accounts };

const statusField = { key: 'status', label: 'Status', type: 'select', options: [{ value: 'aktif', label: 'Aktif' }, { value: 'nonaktif', label: 'Nonaktif' }], default: 'aktif' };
export const masterDataConfig = {
    client: { title: 'Klien', description: 'Data klien digunakan sebagai pihak penerima tagihan invoice.', addLabel: 'Tambah Klien', searchPlaceholder: 'Cari klien...', icon: Users, records: clients, searchKeys: ['nama', 'pic'], historyLabel: 'Riwayat Invoice', historyTitle: 'Riwayat Invoice Klien', historySubtitle: (item) => `Ringkasan invoice untuk ${item.nama}.`, historyFields: (item) => [['Nama Klien', item.nama], ['PIC', item.pic], ['Jumlah Invoice', item.jumlah], ['Status Klien', item.status === 'aktif' ? 'Aktif' : 'Nonaktif']], formRows: [['nama'], ['pic'], ['alamat'], ['telepon', 'email'], ['catatan'], ['status']], fields: [{ key: 'nama', label: 'Nama Klien / Perusahaan', placeholder: 'Nama perusahaan atau klien', required: true, default: '' }, { key: 'pic', label: 'Nama PIC', placeholder: 'Nama penanggung jawab', default: '' }, { key: 'alamat', label: 'Alamat', type: 'textarea', placeholder: 'Alamat lengkap', default: '' }, { key: 'telepon', label: 'Nomor Telepon', placeholder: '021-...', default: '' }, { key: 'email', label: 'Email', type: 'email', placeholder: 'email@domain.com', default: '' }, { key: 'catatan', label: 'Catatan', type: 'textarea', placeholder: 'Catatan tambahan', default: '' }, statusField], columns: [['nama', 'Nama Klien / Perusahaan', 'primary'], ['pic', 'PIC'], ['telepon', 'Telepon'], ['email', 'Email'], ['status', 'Status', 'status'], ['jumlah', 'Invoice', 'count']], messages: ['Klien berhasil ditambahkan.', 'Data klien berhasil diperbarui.', 'Klien berhasil'] },
    vendor: { title: 'Vendor', description: 'Data vendor digunakan pada pencatatan pengeluaran perusahaan.', addLabel: 'Tambah Vendor', searchPlaceholder: 'Cari vendor...', icon: Building2, records: vendors, searchKeys: ['nama'], historyLabel: 'Riwayat Transaksi', historyTitle: 'Riwayat Transaksi Vendor', historySubtitle: (item) => `Ringkasan transaksi untuk ${item.nama}.`, historyFields: (item) => [['Vendor', item.nama], ['PIC', item.pic], ['Jumlah Transaksi', item.jumlah], ['Status Vendor', item.status === 'aktif' ? 'Aktif' : 'Nonaktif']], formRows: [['nama'], ['pic'], ['telepon'], ['email'], ['alamat'], ['status']], fields: [{ key: 'nama', label: 'Nama Vendor', placeholder: 'Nama perusahaan vendor', required: true, default: '' }, { key: 'pic', label: 'Nama PIC', placeholder: 'Nama penanggung jawab', default: '' }, { key: 'telepon', label: 'Nomor Telepon', placeholder: '021-...', default: '' }, { key: 'email', label: 'Email', type: 'email', placeholder: 'email@domain.com', default: '' }, { key: 'alamat', label: 'Alamat', type: 'textarea', default: '' }, statusField], columns: [['nama', 'Vendor', 'primary'], ['pic', 'PIC'], ['telepon', 'Telepon'], ['email', 'Email'], ['status', 'Status', 'status'], ['jumlah', 'Transaksi', 'count']], messages: ['Vendor berhasil ditambahkan.', 'Data vendor berhasil diperbarui.', 'Vendor berhasil'] },
    product: { title: 'Produk & Layanan', description: 'Daftar produk dan layanan yang dapat ditambahkan ke dalam invoice.', addLabel: 'Tambah Produk / Layanan', searchPlaceholder: 'Cari produk...', icon: Package, records: products, searchKeys: ['nama'], formRows: [['nama'], ['deskripsi'], ['harga', 'satuan'], ['status']], fields: [{ key: 'nama', label: 'Nama Produk / Layanan', required: true, default: '' }, { key: 'deskripsi', label: 'Deskripsi', type: 'textarea', default: '' }, { key: 'harga', label: 'Harga Awal (Rp)', type: 'number', required: true, default: '' }, { key: 'satuan', label: 'Satuan', default: 'project' }, statusField], columns: [['nama', 'Nama', 'primary'], ['deskripsi', 'Deskripsi', 'description'], ['harga', 'Harga Awal', 'currency'], ['satuan', 'Satuan'], ['status', 'Status', 'status']], messages: ['Produk & layanan berhasil ditambahkan.', 'Produk & layanan berhasil diperbarui.', 'Status berhasil diperbarui.'] },
    account: { title: 'Rekening', description: 'Kelola rekening bank dan kas perusahaan untuk pencatatan keuangan.', addLabel: 'Tambah Rekening', searchPlaceholder: 'Cari rekening...', icon: CreditCard, records: accounts, searchKeys: ['nama', 'nomor', 'atasNama', 'cabang'], formRows: [['nama'], ['nomor'], ['atasNama', 'cabang'], ['status']], fields: [{ key: 'nama', label: 'Nama Bank / Kas', placeholder: 'BCA, Mandiri, Kas Kantor...', required: true, default: '' }, { key: 'nomor', label: 'Nomor Rekening', placeholder: 'Nomor rekening bank', mono: true, default: '' }, { key: 'atasNama', label: 'Atas Nama', default: '' }, { key: 'cabang', label: 'Cabang', placeholder: 'Opsional', default: '' }, statusField], columns: [['nama', 'Nama Bank / Kas', 'account'], ['nomor', 'Nomor Rekening', 'mono'], ['atasNama', 'Atas Nama'], ['status', 'Status', 'status']], messages: ['Rekening berhasil ditambahkan.', 'Data rekening berhasil diperbarui.', 'Status rekening diperbarui.'], append: true },
};
