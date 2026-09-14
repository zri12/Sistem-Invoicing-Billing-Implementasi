import { defineStore } from 'pinia';
import masterDataService from '@/services/masterDataService';

const pluralFor = { client: 'clients', vendor: 'vendors', product: 'products', account: 'accounts' };
const masterDataRequests = {};

export const useMasterDataStore = defineStore('masterData', {
    state: () => ({
        clients: [],
        vendors: [],
        products: [],
        accounts: [],
        loaded: { clients: false, vendors: false, products: false, accounts: false },
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
        async fetch(kind) {
            const collection = pluralFor[kind];
            this[collection] = await masterDataService.list(kind);
            this.loaded[collection] = true;
        },
        async ensure(kind, force = false) {
            const collection = pluralFor[kind];
            if (!force && this.loaded[collection]) return;
            if (!masterDataRequests[collection]) {
                masterDataRequests[collection] = this.fetch(kind).finally(() => { masterDataRequests[collection] = null; });
            }
            await masterDataRequests[collection];
        },
        async ensureAll(force = false) {
            await Promise.all(['client', 'vendor', 'product', 'account'].map((kind) => this.ensure(kind, force)));
        },
        async add(kind, value) {
            const collection = pluralFor[kind];
            const record = await masterDataService.create(kind, value);
            this[collection] = kind === 'account' ? [...this[collection], record] : [record, ...this[collection]];
            return record;
        },
        async update(kind, id, value) {
            const collection = pluralFor[kind];
            const record = await masterDataService.update(kind, id, value);
            this[collection] = this[collection].map((item) => item.id === id ? record : item);
            return record;
        },
        async toggle(kind, id) {
            const collection = pluralFor[kind];
            const record = await masterDataService.toggleStatus(kind, id);
            this[collection] = this[collection].map((item) => item.id === id ? record : item);
            return record;
        },
        addClient(value) { return this.add('client', value); },
        updateClient(id, value) { return this.update('client', id, value); },
        toggleClientStatus(id) { return this.toggle('client', id); },
        addVendor(value) { return this.add('vendor', value); },
        updateVendor(id, value) { return this.update('vendor', id, value); },
        toggleVendorStatus(id) { return this.toggle('vendor', id); },
        addProduct(value) { return this.add('product', value); },
        updateProduct(id, value) { return this.update('product', id, value); },
        toggleProductStatus(id) { return this.toggle('product', id); },
        addAccount(value) { return this.add('account', value); },
        updateAccount(id, value) { return this.update('account', id, value); },
        toggleAccountStatus(id) { return this.toggle('account', id); },
    },
});
