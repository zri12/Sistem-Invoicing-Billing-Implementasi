import { useState, useCallback } from "react";
import { INVOICES, PEMBAYARAN, PEMASUKAN, type Invoice, type Role, type Pembayaran, type Pemasukan } from "@/data/mock";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import KlienPage from "@/pages/Klien";
import VendorPage from "@/pages/Vendor";
import ProdukLayananPage from "@/pages/ProdukLayanan";
import RekeningPage from "@/pages/Rekening";
import InvoiceList from "@/pages/InvoiceList";
import BuatInvoice from "@/pages/BuatInvoice";
import DetailInvoice from "@/pages/DetailInvoice";
import PreviewInvoice from "@/pages/PreviewInvoice";
import BillingPage from "@/pages/Billing";
import DetailBilling from "@/pages/DetailBilling";
import PembayaranPage from "@/pages/Pembayaran";
import PemasukanPage from "@/pages/Pemasukan";
import PengeluaranPage from "@/pages/Pengeluaran";
import LaporanPage from "@/pages/Laporan";
import DataPerusahaan from "@/pages/DataPerusahaan";
import TemplateInvoice from "@/pages/TemplateInvoice";
import PenomoranInvoice from "@/pages/PenomoranInvoice";
import PenggunaPage from "@/pages/Pengguna";

import Layout from "@/components/Layout";
import ToastContainer, { type ToastData } from "@/components/Toast";

export type Page =
  | "dashboard" | "klien" | "vendor" | "produk" | "rekening"
  | "invoice" | "buat-invoice" | "detail-invoice" | "preview-invoice"
  | "billing" | "detail-billing"
  | "pembayaran" | "pemasukan" | "pengeluaran" | "laporan"
  | "data-perusahaan" | "template-invoice" | "penomoran-invoice" | "pengguna";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [userName, setUserName] = useState("Andri Firmansyah");
  const [page, setPage] = useState<Page>("dashboard");
  const [pageId, setPageId] = useState<string | undefined>();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [payments, setPayments] = useState<Pembayaran[]>(PEMBAYARAN.filter(payment => payment.nominal > 0));
  const [pemasukan, setPemasukan] = useState<Pemasukan[]>(PEMASUKAN);
  const [printInvoiceId, setPrintInvoiceId] = useState<string | undefined>();

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts(t => [...t, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const handleAddPayment = useCallback((payment: Pembayaran, pemasukan: Pemasukan) => {
    setPayments(prev => [...prev, payment]);
    setPemasukan(prev => [...prev, pemasukan]);
    addToast("Pembayaran berhasil dicatat dan tercatat sebagai pemasukan.");
  }, [addToast]);

  const handleSaveInvoice = useCallback((invoice: Invoice, message: string) => {
    setInvoices(previous => {
      const exists = previous.some(item => item.id === invoice.id);
      return exists ? previous.map(item => item.id === invoice.id ? invoice : item) : [...previous, invoice];
    });
    addToast(message);
  }, [addToast]);

  const navigate = useCallback((p: Page, id?: string) => {
    setPage(p);
    setPageId(id);
    window.scrollTo(0, 0);
  }, []);

  const handlePrintInvoice = useCallback((invoiceId: string) => {
    setPrintInvoiceId(invoiceId);
    navigate("preview-invoice", invoiceId);
  }, [navigate]);

  const handleLogin = (r: Role, name: string) => {
    setRole(r);
    setUserName(name);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setPage("dashboard");
    setPageId(undefined);
  };

  if (!loggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  const isReadOnly = role === "manager";

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard role={role} onNavigate={navigate} invoices={invoices} payments={payments} pemasukan={pemasukan} />;
      case "klien": return <KlienPage isReadOnly={isReadOnly} addToast={addToast} />;
      case "vendor": return <VendorPage isReadOnly={isReadOnly} addToast={addToast} />;
      case "produk": return <ProdukLayananPage isReadOnly={isReadOnly} addToast={addToast} />;
      case "rekening": return <RekeningPage isReadOnly={isReadOnly} addToast={addToast} />;
      case "invoice": return <InvoiceList isReadOnly={isReadOnly} onNavigate={navigate} addToast={addToast} invoices={invoices} payments={payments} onAddPayment={handleAddPayment} />;
      case "buat-invoice": return isReadOnly ? <InvoiceList isReadOnly onNavigate={navigate} addToast={addToast} invoices={invoices} payments={payments} onAddPayment={handleAddPayment} /> : <BuatInvoice invoice={invoices.find(invoice => invoice.id === pageId)} invoices={invoices} onNavigate={navigate} addToast={addToast} onSaveInvoice={handleSaveInvoice} />;
      case "detail-invoice": return <DetailInvoice invoiceId={pageId ?? "inv1"} isReadOnly={isReadOnly} onNavigate={navigate} addToast={addToast} invoices={invoices} payments={payments} onAddPayment={handleAddPayment} onPrintInvoice={handlePrintInvoice} />;
      case "preview-invoice": return <PreviewInvoice invoiceId={pageId ?? "inv1"} onNavigate={navigate} invoices={invoices} />;
      case "billing": return <BillingPage onNavigate={navigate} invoices={invoices} payments={payments} />;
      case "detail-billing": return <DetailBilling billingId={pageId ?? "inv1"} isReadOnly={isReadOnly} onNavigate={navigate} addToast={addToast} invoices={invoices} payments={payments} onAddPayment={handleAddPayment} />;
      case "pembayaran": return <PembayaranPage isReadOnly={isReadOnly} addToast={addToast} payments={payments} />;
      case "pemasukan": return <PemasukanPage isReadOnly={isReadOnly} addToast={addToast} pemasukan={pemasukan} />;
      case "pengeluaran": return <PengeluaranPage isReadOnly={isReadOnly} addToast={addToast} />;
      case "laporan": return <LaporanPage invoices={invoices} payments={payments} pemasukan={pemasukan} />;
      case "data-perusahaan": return <DataPerusahaan isReadOnly={isReadOnly} addToast={addToast} />;
      case "template-invoice": return isReadOnly ? <Dashboard role={role} onNavigate={navigate} invoices={invoices} payments={payments} pemasukan={pemasukan} /> : <TemplateInvoice addToast={addToast} />;
      case "penomoran-invoice": return isReadOnly ? <Dashboard role={role} onNavigate={navigate} invoices={invoices} payments={payments} pemasukan={pemasukan} /> : <PenomoranInvoice addToast={addToast} />;
      case "pengguna": return isReadOnly ? <Dashboard role={role} onNavigate={navigate} invoices={invoices} payments={payments} pemasukan={pemasukan} /> : <PenggunaPage addToast={addToast} />;
      default: return <Dashboard role={role} onNavigate={navigate} invoices={invoices} payments={payments} pemasukan={pemasukan} />;
    }
  };

  // Preview invoice has its own full layout
  if (page === "preview-invoice") {
    return (
      <>
        <PreviewInvoice
          invoiceId={pageId ?? "inv1"}
          onNavigate={navigate}
          invoices={invoices}
          autoPrint={printInvoiceId === (pageId ?? "inv1")}
          onAutoPrintComplete={() => setPrintInvoiceId(undefined)}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <>
      <Layout role={role} currentPage={page} onNavigate={navigate} onLogout={handleLogout} userName={userName}>
        {renderPage()}
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
