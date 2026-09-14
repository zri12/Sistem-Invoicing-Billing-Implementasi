import api from '@/services/api';
import { incomeFromApi, expenseFromApi } from '@/services/financeService';
import { invoiceFromApi } from '@/services/invoiceService';
import { masterDataFromApi } from '@/services/masterDataService';
import { paymentFromApi } from '@/services/paymentService';
import { companyFromApi, numberingFromApi, templateFromApi } from '@/services/settingsService';

export default {
    async login(username, password) {
        const { data } = await api.post('/login', { username, password });
        const { bootstrap, ...user } = data.data;

        return {
            user,
            bootstrap: bootstrap ? {
                invoices: bootstrap.invoices.map(invoiceFromApi),
                payments: bootstrap.payments.map(paymentFromApi),
                incomes: bootstrap.incomes.map(incomeFromApi),
                expenses: bootstrap.expenses.map(expenseFromApi),
                clients: masterDataFromApi('client', bootstrap.clients),
                vendors: masterDataFromApi('vendor', bootstrap.vendors),
                products: masterDataFromApi('product', bootstrap.products),
                accounts: masterDataFromApi('account', bootstrap.accounts),
                company: companyFromApi(bootstrap.company),
                template: templateFromApi(bootstrap.template),
                numbering: numberingFromApi(bootstrap.numbering),
            } : null,
        };
    },
    async logout() {
        await api.post('/logout');
    },
    async me() {
        const { data } = await api.get('/me');
        return data.data;
    },
};
