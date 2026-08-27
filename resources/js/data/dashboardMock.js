// Frontend demo data only — replaced by the documented Laravel dashboard API later.
export const dashboardInvoices = [
    { id: 'inv1', number: '001/INV/RKA/VIII/26', client: 'Graha Indonesia Telekomunika', issuedAt: '2026-08-01', dueAt: '2026-08-15', total: 3000000, paid: 3000000, documentStatus: 'diterbitkan', paymentStatus: 'lunas' },
    { id: 'inv2', number: '002/INV/RKA/VIII/26', client: 'PT Maju Jaya Teknologi', issuedAt: '2026-08-05', dueAt: '2026-08-20', total: 10000000, paid: 5000000, documentStatus: 'diterbitkan', paymentStatus: 'dibayar_sebagian' },
    { id: 'inv3', number: '003/INV/RKA/VIII/26', client: 'CV Berkah Abadi Sentosa', issuedAt: '2026-08-01', dueAt: '2026-08-10', total: 1500000, paid: 0, documentStatus: 'diterbitkan', paymentStatus: 'jatuh_tempo' },
    { id: 'inv4', number: '004/INV/RKA/VIII/26', client: 'PT Digital Nusantara', issuedAt: '2026-08-10', dueAt: '2026-09-10', total: 5000000, paid: 0, documentStatus: 'draft', paymentStatus: 'belum_dibayar' },
    { id: 'inv5', number: '005/INV/RKA/VII/26', client: 'CV Berkah Abadi Sentosa', issuedAt: '2026-07-15', dueAt: '2026-07-30', total: 1500000, paid: 0, documentStatus: 'dibatalkan', paymentStatus: 'belum_dibayar' },
];

export const dashboardIncomes = [3000000, 5000000, 350000, 1500000];
export const dashboardExpenses = [850000, 1200000, 750000, 500000, 850000];
export const dashboardChart = [
    { label: 'Mar', income: 4200000, expense: 1800000 }, { label: 'Apr', income: 5800000, expense: 2200000 },
    { label: 'Mei', income: 3900000, expense: 1500000 }, { label: 'Jun', income: 7200000, expense: 3100000 },
    { label: 'Jul', income: 6100000, expense: 2400000 }, { label: 'Agu', income: 8350000, expense: 3300000 },
];
