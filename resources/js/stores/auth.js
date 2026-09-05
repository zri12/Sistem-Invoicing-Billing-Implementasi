import { defineStore } from 'pinia';
import authService from '@/services/authService';

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
                this.user = await authService.login(username, password);
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
