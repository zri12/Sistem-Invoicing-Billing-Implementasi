import { defineStore } from 'pinia';

// TEMPORARY FRONTEND DEMO AUTH — to be replaced by Laravel Auth/API.
const storageKey = 'devspace.demo.user';
const demoAccounts = [
    { username: 'fazrilukman', password: 'admin123', role: 'admin', name: 'Fazri Lukman' },
    { username: 'fahminashruddin', password: 'manager123', role: 'manager', name: 'Fahmi Nashruddin' },
];
const readStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(window.sessionStorage.getItem(storageKey) || 'null'); } catch { return null; }
};

export const useAuthStore = defineStore('auth', {
    state: () => ({ user: readStoredUser() }),
    getters: { role: (state) => state.user?.role || null, isAuthenticated: (state) => Boolean(state.user) },
    actions: {
        loginDemo(username, password) {
            const account = demoAccounts.find((item) => item.username === username && item.password === password);
            if (!account) return false;
            this.user = { username: account.username, name: account.name, role: account.role };
            window.sessionStorage.setItem(storageKey, JSON.stringify(this.user));
            return true;
        },
        logoutDemo() {
            this.user = null;
            window.sessionStorage.removeItem(storageKey);
        },
    },
});
