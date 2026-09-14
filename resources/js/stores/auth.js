import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { useFinanceStore } from '@/stores/finance';
import { useInvoiceStore } from '@/stores/invoice';
import { useMasterDataStore } from '@/stores/masterData';
import { usePaymentStore } from '@/stores/payment';
import { useSettingsStore } from '@/stores/settings';

export const useAuthStore = defineStore('auth', {
    state: () => ({ user: null, loginError: '', initialized: false }),
    getters: {
        role: (state) => state.user?.role || null,
        isAuthenticated: (state) => Boolean(state.user),
    },
    actions: {
        async login(username, password) {
            this.loginError = '';
            try {
                const { user, bootstrap } = await authService.login(username, password);
                this.user = user;
                if (bootstrap) {
                    // Bootstrap hanya memuat daftar ringkas invoice agar login cepat.
                    // Detail (item, total, rekening) selalu diminta saat halaman
                    // invoice dibuka dan tidak boleh dianggap sudah lengkap.
                    useInvoiceStore().$patch({ invoices: bootstrap.invoices, loaded: true, detailedInvoiceIds: [] });
                    usePaymentStore().$patch({ payments: bootstrap.payments, loaded: true });
                    useFinanceStore().$patch({
                        incomes: bootstrap.incomes,
                        expenses: bootstrap.expenses,
                        loaded: { incomes: true, expenses: true },
                    });
                    useMasterDataStore().$patch({
                        clients: bootstrap.clients,
                        vendors: bootstrap.vendors,
                        products: bootstrap.products,
                        accounts: bootstrap.accounts,
                        loaded: { clients: true, vendors: true, products: true, accounts: true },
                    });
                    useSettingsStore().$patch({
                        company: bootstrap.company,
                        invoiceTemplate: bootstrap.template,
                        invoiceNumbering: bootstrap.numbering,
                        loaded: true,
                        invoiceDocumentLoaded: true,
                    });
                }
                return true;
            } catch (error) {
                this.loginError = error.response?.data?.errors?.username?.[0]
                    || error.response?.data?.message
                    || 'Username atau password salah. Silakan coba kembali.';
                return false;
            }
        },
        async logout() {
            try {
                await authService.logout();
            } finally {
                this.user = null;
            }
        },
        async fetchCurrentUser() {
            try {
                this.user = await authService.me();
            } catch {
                this.user = null;
            } finally {
                this.initialized = true;
            }
        },
    },
});
