export const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
export const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
