import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// The UI paginates its complete collection locally. Follow server pages so a
// refresh does not silently drop records beyond the first API page.
export async function fetchAll(path, params = {}) {
    const items = [];
    let page = 1, lastPage = 1;
    do {
        const { data } = await api.get(path, { params: { per_page: 200, ...params, page } });
        items.push(...data.data.items);
        lastPage = data.data.meta.last_page;
        page++;
    } while (page <= lastPage);
    return items;
}

export default api;
