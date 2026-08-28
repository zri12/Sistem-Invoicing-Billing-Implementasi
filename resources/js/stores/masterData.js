import { defineStore } from 'pinia';
import { masterDataSeed } from '@/data/masterDataMock';

const clone = (value) => JSON.parse(JSON.stringify(value));
const pluralFor = { client: 'clients', vendor: 'vendors', product: 'products', account: 'accounts' };

export const useMasterDataStore = defineStore('masterData', {
    state: () => ({
        clients: clone(masterDataSeed.clients),
        vendors: clone(masterDataSeed.vendors),
        products: clone(masterDataSeed.products),
        accounts: clone(masterDataSeed.accounts),
    }),
    getters: {
        recordsFor: (state) => (kind) => state[pluralFor[kind]] || [],
        activeRecordsFor: (state) => (kind) => (state[pluralFor[kind]] || []).filter((record) => record.status === 'aktif'),
        getClientById: (state) => (id) => state.clients.find((record) => record.id === id),
        getVendorById: (state) => (id) => state.vendors.find((record) => record.id === id),
        getProductById: (state) => (id) => state.products.find((record) => record.id === id),
        getAccountById: (state) => (id) => state.accounts.find((record) => record.id === id),
    },
    actions: {
        add(kind, value) {
            const collection = pluralFor[kind];
            const record = { ...value, id: `${kind}-${Date.now()}` };
            if (kind === 'client' || kind === 'vendor') record.jumlah = 0;
            this[collection] = kind === 'account' ? [...this[collection], record] : [record, ...this[collection]];
            return record;
        },
        update(kind, id, value) {
            const collection = pluralFor[kind];
            this[collection] = this[collection].map((record) => record.id === id ? { ...record, ...value, id } : record);
        },
        toggle(kind, id) {
            const collection = pluralFor[kind];
            this[collection] = this[collection].map((record) => record.id === id ? { ...record, status: record.status === 'aktif' ? 'nonaktif' : 'aktif' } : record);
        },
        addClient(value) { return this.add('client', value); },
        updateClient(id, value) { this.update('client', id, value); },
        toggleClientStatus(id) { this.toggle('client', id); },
        addVendor(value) { return this.add('vendor', value); },
        updateVendor(id, value) { this.update('vendor', id, value); },
        toggleVendorStatus(id) { this.toggle('vendor', id); },
        addProduct(value) { return this.add('product', value); },
        updateProduct(id, value) { this.update('product', id, value); },
        toggleProductStatus(id) { this.toggle('product', id); },
        addAccount(value) { return this.add('account', value); },
        updateAccount(id, value) { this.update('account', id, value); },
        toggleAccountStatus(id) { this.toggle('account', id); },
    },
});
