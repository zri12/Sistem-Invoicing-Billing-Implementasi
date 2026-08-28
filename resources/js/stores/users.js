import { defineStore } from 'pinia';

// FRONTEND DEMO ONLY. Laravel must own users, passwords, and authorization in production.
const defaultUsers = [
    { id: 'u1', name: 'Fazri Lukman', email: 'fazri@ruangkreasi.co.id', username: 'fazrilukman', password: 'admin123', role: 'admin', status: 'aktif', createdAt: '2026-08-01' },
    { id: 'u2', name: 'Fahmi Nashruddin', email: 'fahmi@ruangkreasi.co.id', username: 'fahminashruddin', password: 'manager123', role: 'manager', status: 'aktif', createdAt: '2026-08-01' },
    { id: 'u3', name: 'Budi Santoso', email: 'budi@ruangkreasi.co.id', username: 'budi.santoso', role: 'admin', status: 'aktif', createdAt: '2026-08-12' },
    { id: 'u4', name: 'Dewi Kusuma', email: 'dewi@ruangkreasi.co.id', username: 'dewi.kusuma', role: 'manager', status: 'nonaktif', createdAt: '2026-08-20' },
];

export const useUsersStore = defineStore('users', {
    state: () => ({ users: defaultUsers.map((user) => ({ ...user })) }),
    actions: {
        findByUsername(username) { return this.users.find((user) => user.username.toLowerCase() === username.trim().toLowerCase()); },
        addUser(payload) {
            if (this.findByUsername(payload.username)) throw new Error('Username sudah digunakan.');
            this.users.push({ id: `u-${Date.now()}`, createdAt: '2026-08-28', ...payload });
        },
        updateUser(id, payload) {
            const duplicate = this.findByUsername(payload.username);
            if (duplicate && duplicate.id !== id) throw new Error('Username sudah digunakan.');
            this.users = this.users.map((user) => user.id === id ? { ...user, ...payload } : user);
        },
        setStatus(id, status) { this.users = this.users.map((user) => user.id === id ? { ...user, status } : user); },
    },
});
