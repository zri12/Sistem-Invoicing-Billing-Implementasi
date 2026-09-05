import { defineStore } from 'pinia';
import userService from '@/services/userService';

export const useUsersStore = defineStore('users', {
    state: () => ({ users: [], loaded: false }),
    actions: {
        async ensure() {
            if (!this.loaded) {
                this.users = await userService.list();
                this.loaded = true;
            }
        },
        findByUsername(username) { return this.users.find((user) => user.username.toLowerCase() === username.trim().toLowerCase()); },
        async addUser(payload) {
            const user = await userService.create(payload);
            this.users = [...this.users, user];
            return user;
        },
        async updateUser(id, payload) {
            const user = await userService.update(id, payload);
            this.users = this.users.map((item) => item.id === id ? user : item);
            return user;
        },
        async setStatus(id) {
            const user = await userService.toggleStatus(id);
            this.users = this.users.map((item) => item.id === id ? user : item);
            return user;
        },
    },
});
