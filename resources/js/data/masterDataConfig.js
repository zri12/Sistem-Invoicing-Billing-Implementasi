import { Building2, CreditCard, Package, Users } from 'lucide-vue-next';

const statusField = {
    key: 'status', label: 'Status', type: 'select', default: 'aktif',
    options: [{ value: 'aktif', label: 'Aktif' }, { value: 'nonaktif', label: 'Nonaktif' }],
};

export const masterDataConfig = {
    client: {
        title: 'Klien', description: 'Data klien digunakan sebagai pihak penerima tagihan invoice.', addLabel: 'Tambah Klien', searchPlaceholder: 'Cari klien...', icon: Users,
        searchKeys: ['nama', 'pic'], historyLabel: 'Riwayat Invoice', historyTitle: 'Riwayat Invoice Klien',
        historySubtitle: (item) => `Ringkasan invoice untuk ${item.nama}.`,
        historyFields: (item) => [['Nama Klien', item.nama], ['PIC', item.pic], ['Jumlah Invoice', item.jumlah], ['Status Klien', item.status === 'aktif' ? 'Aktif' : 'Nonaktif']],
        formRows: [['nama'], ['pic'], ['alamat'], ['telepon', 'email'], ['catatan'], ['status']],
        fields: [
            { key: 'nama', label: 'Nama Klien / Perusahaan', placeholder: 'Nama perusahaan atau klien', required: true, default: '' },
            { key: 'pic', label: 'Nama PIC', placeholder: 'Nama penanggung jawab', default: '' },
            { key: 'alamat', label: 'Alamat', type: 'textarea', placeholder: 'Alamat lengkap', default: '' },
            { key: 'telepon', label: 'Nomor Telepon', placeholder: '021-...', default: '' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'email@domain.com', default: '' },
            { key: 'catatan', label: 'Catatan', type: 'textarea', placeholder: 'Catatan tambahan', default: '' }, statusField,
        ],
        columns: [['nama', 'Nama Klien / Perusahaan', 'primary'], ['pic', 'PIC'], ['telepon', 'Telepon'], ['email', 'Email'], ['status', 'Status', 'status'], ['jumlah', 'Invoice', 'count']],
        messages: ['Klien berhasil ditambahkan.', 'Data klien berhasil diperbarui.', 'Klien berhasil'],
    },
    vendor: {
        title: 'Vendor', description: 'Data vendor digunakan pada pencatatan pengeluaran perusahaan.', addLabel: 'Tambah Vendor', searchPlaceholder: 'Cari vendor...', icon: Building2,
        searchKeys: ['nama'], historyLabel: 'Riwayat Transaksi', historyTitle: 'Riwayat Transaksi Vendor',
        historySubtitle: (item) => `Ringkasan transaksi untuk ${item.nama}.`,
        historyFields: (item) => [['Vendor', item.nama], ['PIC', item.pic], ['Jumlah Transaksi', item.jumlah], ['Status Vendor', item.status === 'aktif' ? 'Aktif' : 'Nonaktif']],
        formRows: [['nama'], ['pic'], ['telepon'], ['email'], ['alamat'], ['status']],
        fields: [
            { key: 'nama', label: 'Nama Vendor', placeholder: 'Nama perusahaan vendor', required: true, default: '' },
            { key: 'pic', label: 'Nama PIC', placeholder: 'Nama penanggung jawab', default: '' },
            { key: 'telepon', label: 'Nomor Telepon', placeholder: '021-...', default: '' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'email@domain.com', default: '' },
            { key: 'alamat', label: 'Alamat', type: 'textarea', default: '' }, statusField,
        ],
        columns: [['nama', 'Vendor', 'primary'], ['pic', 'PIC'], ['telepon', 'Telepon'], ['email', 'Email'], ['status', 'Status', 'status'], ['jumlah', 'Transaksi', 'count']],
        messages: ['Vendor berhasil ditambahkan.', 'Data vendor berhasil diperbarui.', 'Vendor berhasil'],
    },
    product: {
        title: 'Produk & Layanan', description: 'Daftar produk dan layanan yang dapat ditambahkan ke dalam invoice.', addLabel: 'Tambah Produk / Layanan', searchPlaceholder: 'Cari produk...', icon: Package,
        searchKeys: ['nama'], formRows: [['nama'], ['deskripsi'], ['harga', 'satuan'], ['status']],
        fields: [
            { key: 'nama', label: 'Nama Produk / Layanan', required: true, default: '' },
            { key: 'deskripsi', label: 'Deskripsi', type: 'textarea', default: '' },
            { key: 'harga', label: 'Harga Awal (Rp)', type: 'number', required: true, default: '' },
            { key: 'satuan', label: 'Satuan', default: 'project' }, statusField,
        ],
        columns: [['nama', 'Nama', 'primary'], ['deskripsi', 'Deskripsi', 'description'], ['harga', 'Harga Awal', 'currency'], ['satuan', 'Satuan'], ['status', 'Status', 'status']],
        messages: ['Produk & layanan berhasil ditambahkan.', 'Produk & layanan berhasil diperbarui.', 'Status berhasil diperbarui.'],
    },
    account: {
        title: 'Rekening', description: 'Kelola rekening bank dan kas perusahaan untuk pencatatan keuangan.', addLabel: 'Tambah Rekening', searchPlaceholder: 'Cari rekening...', icon: CreditCard,
        searchKeys: ['nama', 'nomor', 'atasNama', 'cabang'], formRows: [['nama'], ['nomor'], ['atasNama', 'cabang'], ['status']],
        fields: [
            { key: 'nama', label: 'Nama Bank / Kas', placeholder: 'BCA, Mandiri, Kas Kantor...', required: true, default: '' },
            { key: 'nomor', label: 'Nomor Rekening', placeholder: 'Nomor rekening bank', mono: true, default: '' },
            { key: 'atasNama', label: 'Atas Nama', default: '' },
            { key: 'cabang', label: 'Cabang', placeholder: 'Opsional', default: '' }, statusField,
        ],
        columns: [['nama', 'Nama Bank / Kas', 'account'], ['nomor', 'Nomor Rekening', 'mono'], ['atasNama', 'Atas Nama'], ['status', 'Status', 'status']],
        messages: ['Rekening berhasil ditambahkan.', 'Data rekening berhasil diperbarui.', 'Status rekening diperbarui.'],
    },
};
