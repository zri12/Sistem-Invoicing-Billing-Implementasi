import { useEffect } from "react";
import { ChevronLeft, Download, Printer } from "lucide-react";
import { KLIEN, formatRupiah, formatDateLong, type Invoice } from "@/data/mock";
import DevspaceLogo from "@/components/DevspaceLogo";
import type { Page } from "@/App";

interface Props {
  invoiceId: string;
  onNavigate: (page: Page, id?: string) => void;
  invoices: Invoice[];
  autoPrint?: boolean;
  onAutoPrintComplete?: () => void;
}

export default function PreviewInvoice({ invoiceId, onNavigate, invoices, autoPrint = false, onAutoPrintComplete }: Props) {
  const inv = invoices.find(i => i.id === invoiceId) ?? invoices[0];
  const klien = KLIEN.find(k => k.id === inv.klienId);

  useEffect(() => {
    if (!autoPrint) return;

    const timer = window.setTimeout(() => {
      onAutoPrintComplete?.();
      window.print();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [autoPrint, onAutoPrintComplete]);

  return (
    <div className="min-h-full bg-[#E8EAED]">
      {/* Toolbar */}
      <div className="invoice-toolbar bg-white border-b border-[#E2E6EC] px-3 sm:px-6 py-3 flex flex-wrap items-center gap-2 sm:gap-4 sticky top-0 z-10">
        <button onClick={() => onNavigate("detail-invoice", inv.id)} className="flex items-center gap-1.5 text-sm text-[#667085] hover:text-[#172033]">
          <ChevronLeft size={15} /> Kembali
        </button>
        <div className="flex-1 text-sm text-[#667085]">Preview Invoice — {inv.nomorInvoice}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={14} /> Download PDF
          </button>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 text-sm">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* A4 Preview */}
      <div className="invoice-print-shell py-5 sm:py-10 flex justify-start sm:justify-center overflow-x-auto px-3 sm:px-6">
        <div
          className="invoice-print bg-white shadow-xl"
          style={{ width: 794, minHeight: 1123, fontFamily: "'Inter', sans-serif" }}
        >
          <div className="invoice-print-content px-14 py-12" style={{ position: "relative" }}>
            {/* Subtle background pattern */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04,
              backgroundImage: `repeating-linear-gradient(45deg, #173B6C 0, #173B6C 1px, transparent 0, transparent 50%)`,
              backgroundSize: "20px 20px"
            }} />

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, position: "relative" }}>
              <div>
                <DevspaceLogo size={40} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#172033" }}>Professional & Valuable Digital Transformation</div>
                <div style={{ fontSize: 11, color: "#667085", marginTop: 4 }}>Website: www.ruangkreasi.co.id | Email: info@ruangkreasi.co.id</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #E2E6EC", marginBottom: 32 }} />

            {/* Invoice meta */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, position: "relative" }}>
              <div style={{ fontSize: 13 }}>
                <div style={{ display: "flex", gap: 24, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "#172033", width: 110 }}>Invoice Name</span>
                  <span style={{ color: "#172033" }}>: {inv.namaInvoice}</span>
                </div>
                <div style={{ display: "flex", gap: 24, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "#172033", width: 110 }}>Invoice Date</span>
                  <span style={{ color: "#172033" }}>: {formatDateLong(inv.tanggalInvoice)}</span>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  <span style={{ fontWeight: 600, color: "#172033", width: 110 }}>Due Date</span>
                  <span style={{ color: "#172033" }}>: {formatDateLong(inv.tanggalJatuhTempo)}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: 190, maxWidth: 220 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#172033", letterSpacing: 1.5, lineHeight: 1.1, whiteSpace: "nowrap" }}>INVOICE</div>
                <div style={{ fontSize: 13, color: "#667085", marginTop: 4, whiteSpace: "nowrap" }}>No. {inv.nomorInvoice}</div>
              </div>
            </div>

            {/* Bill To + Total Due */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 36, position: "relative" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#172033", marginBottom: 8 }}>Bill To:</div>
                <div style={{ fontSize: 13, color: "#172033", lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 600 }}>{klien?.nama ?? inv.klienNama}</div>
                  <div style={{ color: "#667085" }}>{klien?.alamat}</div>
                  {klien?.telepon && <div style={{ color: "#667085" }}>Ph: {klien.telepon}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#172033", marginBottom: 6 }}>Total Due:</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#172033" }}>{formatRupiah(inv.total)}</div>
              </div>
            </div>

            {/* Items table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8, position: "relative", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  <th style={{ border: "1px solid #E2E6EC", padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#172033" }}>Item Description</th>
                  <th style={{ border: "1px solid #E2E6EC", padding: "10px 14px", textAlign: "right", fontWeight: 600, color: "#172033", width: 140 }}>Price</th>
                  <th style={{ border: "1px solid #E2E6EC", padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "#172033", width: 60 }}>Qty</th>
                  <th style={{ border: "1px solid #E2E6EC", padding: "10px 14px", textAlign: "right", fontWeight: 600, color: "#172033", width: 140 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map(item => (
                  <tr key={item.id}>
                    <td style={{ border: "1px solid #E2E6EC", padding: "10px 14px", color: "#172033" }}>{item.deskripsi || item.produkLayanan}</td>
                    <td style={{ border: "1px solid #E2E6EC", padding: "10px 14px", textAlign: "right", color: "#172033" }}>{formatRupiah(item.harga)}</td>
                    <td style={{ border: "1px solid #E2E6EC", padding: "10px 14px", textAlign: "center", color: "#172033" }}>{item.qty}</td>
                    <td style={{ border: "1px solid #E2E6EC", padding: "10px 14px", textAlign: "right", color: "#172033" }}>{formatRupiah(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32, position: "relative" }}>
              <div style={{ width: 280, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#667085" }}>
                  <span>Subtotal</span>
                  <span style={{ color: "#172033" }}>{formatRupiah(inv.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#667085" }}>
                  <span>Discount</span>
                  <span style={{ color: "#172033" }}>{inv.diskon > 0 ? formatRupiah(inv.diskon) : "0"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1.5px solid #172033", fontWeight: 700, fontSize: 14, color: "#172033" }}>
                  <span>Total Due</span>
                  <span>{formatRupiah(inv.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: 24, position: "relative" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#172033", marginBottom: 6 }}>Payment Method:</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#172033" }}>BCA 1394 5494 63</div>
              <div style={{ fontSize: 13, color: "#172033" }}>Ruang Kreasi Aplikasi PT</div>
              <div style={{ fontSize: 13, color: "#172033" }}>KCP Cimahi</div>
            </div>

            {/* Terms */}
            <div style={{ marginBottom: 40, position: "relative" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#172033", marginBottom: 6 }}>Terms & Condition:</div>
              <ul style={{ paddingLeft: 20, fontSize: 13, color: "#172033", lineHeight: 1.8 }}>
                <li>Silahkan lakukan pembayaran ke rekening yang tertera di atas</li>
                <li>Mohon konfirmasi pembayaran melalui email balasan pada email tagihan ini</li>
              </ul>
            </div>

            {/* Signature area */}
            <div style={{ display: "flex", justifyContent: "flex-end", position: "relative" }}>
              <div style={{ textAlign: "center", position: "relative", minWidth: 200 }}>
                <div style={{ fontSize: 13, color: "#172033", marginBottom: 8 }}>Hormat kami,</div>

                {/* Signature SVG (handwritten style) */}
                <svg width="140" height="44" viewBox="0 0 140 44" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                  <path d="M8,32 C18,8 30,38 44,22 C52,14 58,32 68,24 C76,16 82,30 94,24 C104,18 112,28 120,22 C126,18 130,24 134,20"
                    fill="none" stroke="#172033" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M96,24 C100,34 108,28 114,32" fill="none" stroke="#172033" strokeWidth="1.3" strokeLinecap="round" />
                </svg>

                {/* Signature underline */}
                <div style={{ borderBottom: "1.5px solid #172033", width: 160, margin: "0 auto 8px" }} />

                <div style={{ fontSize: 13, fontWeight: 700, color: "#172033" }}>Andri Firmansyah</div>
                <div style={{ fontSize: 12, color: "#667085" }}>Admin Keuangan — PT. Ruang Kreasi Aplikasi</div>

                {/* Company stamp — positioned overlapping the signature */}
                <div style={{ position: "absolute", right: -28, top: 0 }}>
                  <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.75 }}>
                    {/* Outer ring */}
                    <circle cx="48" cy="48" r="45" fill="none" stroke="#1E3A6E" strokeWidth="2.5" />
                    {/* Inner ring */}
                    <circle cx="48" cy="48" r="36" fill="none" stroke="#1E3A6E" strokeWidth="1" />
                    {/* Top arc text */}
                    <path id="stampTopArc" d="M 10,48 A 38,38 0 0,1 86,48" fill="none" />
                    <text fontSize="7.5" fontWeight="700" fill="#1E3A6E" letterSpacing="0.8" fontFamily="Inter, sans-serif">
                      <textPath href="#stampTopArc" startOffset="50%" textAnchor="middle">PT. RUANG KREASI APLIKASI</textPath>
                    </text>
                    {/* DEVSPACE diamond logo in center */}
                    <g transform="translate(32, 28)">
                      <g transform="rotate(45 16 16)">
                        <rect x="17" y="3" width="11" height="11" rx="2" fill="#EF4444" />
                        <rect x="3" y="17" width="11" height="11" rx="2" fill="#1E3A6E" />
                        <rect x="3" y="3" width="11" height="11" rx="2" fill="#1E3A6E" />
                        <rect x="17" y="17" width="11" height="11" rx="2" fill="#EF4444" />
                        <rect x="12" y="12" width="8" height="8" rx="1.5" fill="white" />
                      </g>
                    </g>
                    {/* DEVSPACE label */}
                    <text x="48" y="62" textAnchor="middle" fontSize="7" fontWeight="800" fill="#1E3A6E" letterSpacing="2.5" fontFamily="Inter, sans-serif">DEVSPACE</text>
                    {/* Bottom arc text */}
                    <path id="stampBotArc" d="M 14,48 A 34,34 0 0,0 82,48" fill="none" />
                    <text fontSize="6.5" fill="#1E3A6E" letterSpacing="0.5" fontFamily="Inter, sans-serif">
                      <textPath href="#stampBotArc" startOffset="50%" textAnchor="middle">CIMAHI · JAWA BARAT</textPath>
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
