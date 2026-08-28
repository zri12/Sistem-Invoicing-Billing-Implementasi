import { defineStore } from 'pinia';
import { useUsersStore } from '@/stores/users';

// TEMPORARY FRONTEND DEMO AUTH — to be replaced by Laravel Auth/API.
const storageKey = 'devspace.demo.user';
const readStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(window.sessionStorage.getItem(storageKey) || 'null'); } catch { return null; }
};

export const useAuthStore = defineStore('auth', {
    state: () => ({ user: readStoredUser(), loginError: '' }),
    getters: { role: (state) => state.user?.role || null, isAuthenticated: (state) => Boolean(state.user) },
    actions: {
        loginDemo(username, password) {
            const account = useUsersStore().findByUsername(username);
            this.loginError = '';
            if (!account || account.password !== password) { this.loginError = 'Username atau password salah. Silakan coba kembali.'; return false; }
            if (account.status !== 'aktif') { this.loginError = 'Akun tidak aktif.'; return false; }
            this.user = { id: account.id, username: account.username, name: account.name, role: account.role };
            window.sessionStorage.setItem(storageKey, JSON.stringify(this.user));
            return true;
        },
        logoutDemo() {
            this.user = null;
            this.loginError = '';
            window.sessionStorage.removeItem(storageKey);
        },
    },
});
