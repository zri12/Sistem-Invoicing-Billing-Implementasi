import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// The session token can change after login, logout, or expiration. Read the
// current XSRF cookie for each request instead of pinning the page's meta tag.
export const refreshCsrf = () => axios.get('/sanctum/csrf-cookie', { withCredentials: true });

api.interceptors.response.use(undefined, async (error) => {
    const request = error.config;
    // A 419 is rejected by CSRF middleware before the application handles the
    // request, so one retry after refreshing the cookie is safe.
    if (error.response?.status === 419 && request && !request._csrfRetried) {
        request._csrfRetried = true;
        await refreshCsrf();
        return api(request);
    }
    return Promise.reject(error);
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
