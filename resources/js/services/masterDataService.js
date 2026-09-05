import api from '@/services/api';

// snake_case API <-> Indonesian/camelCase Pinia shape, per
// docs/backend/FRONTEND_BACKEND_MAPPING.md sections 7-10.
const clientFromApi = (c) => ({ id: c.id, nama: c.name, pic: c.pic_name, alamat: c.address, telepon: c.phone, email: c.email, catatan: c.notes, status: c.status, jumlah: c.invoice_count ?? 0 });
const clientToApi = (v) => ({ name: v.nama, pic_name: v.pic || null, address: v.alamat || null, phone: v.telepon || null, email: v.email || null, notes: v.catatan || null });

const vendorFromApi = (v) => ({ id: v.id, nama: v.name, pic: v.pic_name, alamat: v.address, telepon: v.phone, email: v.email, status: v.status, jumlah: v.expense_count ?? 0 });
const vendorToApi = (v) => ({ name: v.nama, pic_name: v.pic || null, address: v.alamat || null, phone: v.telepon || null, email: v.email || null, notes: v.catatan || null });

const productFromApi = (p) => ({ id: p.id, nama: p.name, deskripsi: p.description, harga: Number(p.default_price), satuan: p.unit, status: p.status });
const productToApi = (v) => ({ name: v.nama, description: v.deskripsi || null, default_price: Number(v.harga) || 0, unit: v.satuan || null });

const accountFromApi = (a) => ({ id: a.id, nama: a.name, nomor: a.account_number, atasNama: a.account_holder, cabang: a.branch, status: a.status });
const accountToApi = (v) => ({ name: v.nama, account_number: v.nomor || null, account_holder: v.atasNama || null, branch: v.cabang || null });

const registry = {
    client: { path: '/clients', from: clientFromApi, to: clientToApi },
    vendor: { path: '/vendors', from: vendorFromApi, to: vendorToApi },
    product: { path: '/products-services', from: productFromApi, to: productToApi },
    account: { path: '/accounts', from: accountFromApi, to: accountToApi },
};

export default {
    async list(kind) {
        const { path, from } = registry[kind];
        const { data } = await api.get(path, { params: { per_page: 100 } });
        return data.data.items.map(from);
    },
    async create(kind, value) {
        const { path, from, to } = registry[kind];
        const { data } = await api.post(path, to(value));
        return from(data.data);
    },
    async update(kind, id, value) {
        const { path, from, to } = registry[kind];
        const { data } = await api.put(`${path}/${id}`, to(value));
        return from(data.data);
    },
    async toggleStatus(kind, id) {
        const { path, from } = registry[kind];
        const { data } = await api.patch(`${path}/${id}/status`, {});
        return from(data.data);
    },
};
