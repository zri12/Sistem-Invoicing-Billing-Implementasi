import api from '@/services/api';

export default {
    async ensureCsrfCookie() {
        await api.get('/sanctum/csrf-cookie', { baseURL: '/' });
    },
    async login(username, password) {
        await this.ensureCsrfCookie();
        const { data } = await api.post('/login', { username, password });
        return data.data;
    },
    async logout() {
        await api.post('/logout');
    },
    async me() {
        const { data } = await api.get('/me');
        return data.data;
    },
};
