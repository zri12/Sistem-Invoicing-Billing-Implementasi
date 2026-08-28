export const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
export const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
export const todayIso = () => {
    const date = new Date();
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const currentMonthKey = () => todayIso().slice(0, 7);
export const formatInvoiceCurrency = (value) => `Rp. ${Number(value || 0).toLocaleString('id-ID')}`;
export const formatInvoiceDate = (value) => {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
