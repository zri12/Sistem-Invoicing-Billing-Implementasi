import api from '@/services/api';

const fromApi = (u) => ({ id: u.id, name: u.name, email: u.email || '', username: u.username, role: u.role, status: u.status, createdAt: u.created_at });

export default {
    async list() {
        const { data } = await api.get('/users', { params: { per_page: 200 } });
        return data.data.items.map(fromApi);
    },
    async create(payload) {
        const { data } = await api.post('/users', {
            name: payload.name, username: payload.username, email: payload.email || null,
            password: payload.password, role: payload.role, status: payload.status || 'aktif',
        });
        return fromApi(data.data);
    },
    async update(id, payload) {
        const body = { name: payload.name, username: payload.username, email: payload.email || null, role: payload.role };
        if (payload.password) body.password = payload.password;
        const { data } = await api.put(`/users/${id}`, body);
        return fromApi(data.data);
    },
    async toggleStatus(id) {
        const { data } = await api.patch(`/users/${id}/status`);
        return fromApi(data.data);
    },
};
