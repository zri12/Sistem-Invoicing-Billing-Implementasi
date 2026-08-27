import { defineStore } from 'pinia';
import { useInvoiceStore } from '@/stores/invoice';
import { usePaymentStore } from '@/stores/payment';

// TEMPORARY FRONTEND DEMO STATE — Laravel finance endpoints will replace this store.
const initialExpenses = [
    { id: 'pe1', date: '2026-08-02', vendorId: 'v2', category: 'Infrastruktur', description: 'Biaya hosting server Agustus', amount: 850000, transactionType: 'transfer', destinationAccountId: 'r1', referenceNumber: 'TRF-EXP-001', proofName: 'bukti1.jpg', notes: '' },
    { id: 'pe2', date: '2026-08-05', vendorId: 'v1', category: 'Peralatan', description: 'Pembelian SSD laptop developer', amount: 1200000, transactionType: 'cash', destinationAccountId: null, referenceNumber: '', proofName: 'bukti2.jpg', notes: 'SSD 512GB Samsung' },
    { id: 'pe3', date: '2026-08-10', vendorId: '', category: 'Operasional', description: 'Biaya listrik dan internet kantor', amount: 750000, transactionType: 'qris', destinationAccountId: null, referenceNumber: '', proofName: '', notes: '' },
    { id: 'pe4', date: '2026-08-15', vendorId: 'v3', category: 'Marketing', description: 'Desain materi presentasi klien', amount: 500000, transactionType: 'credit', destinationAccountId: null, referenceNumber: '', proofName: '', notes: '' },
    { id: 'pe5', date: '2026-07-25', vendorId: 'v2', category: 'Infrastruktur', description: 'Biaya hosting server Juli', amount: 850000, transactionType: 'transfer', destinationAccountId: 'r1', referenceNumber: 'TRF-EXP-005', proofName: 'bukti5.jpg', notes: '' },
];

export const useFinanceStore = defineStore('finance', {
    state: () => ({ manualIncomes: [], expenses: initialExpenses }),
    getters: {
        allIncomes(state) { const payments=usePaymentStore(),invoices=useInvoiceStore(); const derived=payments.payments.map((payment)=>{const invoice=invoices.getInvoiceById(payment.invoiceId);return {id:`income-${payment.id}`,source:'invoice',paymentId:payment.id,invoiceId:payment.invoiceId,date:payment.paymentDate,category:'Pendapatan Jasa',description:`Pembayaran Invoice ${invoice?.number||payment.invoiceId} — ${invoice?.name||''}`.trim(),invoiceNumber:invoice?.number||'-',client:invoice?.client||'-',accountId:payment.accountId,amount:payment.amount,notes:payment.notes||''}});return [...derived,...state.manualIncomes].sort((a,b)=>b.date.localeCompare(a.date)); },
        cashbookEntries() { return [...this.allIncomes.map((income)=>({id:income.id,date:income.date,type:'debit',source:income.source,description:income.description,amount:income.amount})),...this.expenses.map((expense)=>({id:expense.id,date:expense.date,type:'credit',source:'expense',description:expense.description,amount:expense.amount}))].sort((a,b)=>b.date.localeCompare(a.date)); },
    },
    actions: {
        addManualIncome(income) { const amount=Number(income.amount||0);if(!income.date||!income.category?.trim()||!income.description?.trim()||amount<=0)throw new Error('Lengkapi tanggal, kategori, keterangan, dan nominal pemasukan.');const record={...income,id:`income-manual-${Date.now()}`,source:'manual',amount,paymentId:null,invoiceId:null,invoiceNumber:'-',client:'-'};this.manualIncomes.unshift(record);return record; },
        updateManualIncome(id,income) { const amount=Number(income.amount||0);if(!income.date||!income.category?.trim()||!income.description?.trim()||amount<=0)throw new Error('Lengkapi tanggal, kategori, keterangan, dan nominal pemasukan.');this.manualIncomes=this.manualIncomes.map((item)=>item.id===id?{...item,...income,amount,source:'manual'}:item); },
        addExpense(expense) { return this.saveExpense({...expense,id:`expense-${Date.now()}`},false); },
        updateExpense(id,expense) { return this.saveExpense({...expense,id},true); },
        saveExpense(expense,update) { const amount=Number(expense.amount||0);if(!expense.date||!expense.category?.trim()||!expense.description?.trim()||amount<=0||!expense.transactionType)throw new Error('Lengkapi tanggal, kategori, keterangan, nominal, dan jenis transaksi pengeluaran.');if(expense.transactionType==='transfer'&&!expense.destinationAccountId)throw new Error('Rekening tujuan wajib dipilih untuk transaksi Transfer.');const record={...expense,amount,destinationAccountId:expense.transactionType==='transfer'?expense.destinationAccountId:null};if(update)this.expenses=this.expenses.map((item)=>item.id===record.id?record:item);else this.expenses.unshift(record);return record; },
    },
});
