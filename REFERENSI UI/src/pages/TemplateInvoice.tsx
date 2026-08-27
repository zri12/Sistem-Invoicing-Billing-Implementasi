import { useState } from "react";
import { Save } from "lucide-react";
import DevspaceLogo from "@/components/DevspaceLogo";
import { formatRupiah } from "@/data/mock";

interface Props {
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function TemplateInvoice({ addToast }: Props) {
  const [config, setConfig] = useState({
    showLogo: true,
    showTagline: true,
    showInvoiceTitle: true,
    invoiceTitleText: "INVOICE",
    showNomor: true,
    showTanggal: true,
    showJatuhTempo: true,
    showKlien: true,
    showItemTable: true,
    showSubtotal: true,
    showDiskon: true,
    showTotal: true,
    showBankInfo: true,
    showTerms: true,
    showStamp: true,
    showSignature: true,
    showSignerName: true,
    showSignerPosition: true,
  });

  const toggle = (key: keyof typeof config) => setConfig(c => ({ ...c, [key]: !c[key] }));

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#172033]">Template Invoice</h1>
          <p className="text-sm text-[#667085] mt-0.5">Konfigurasi tampilan dan elemen invoice yang diterbitkan.</p>
        </div>
        <button onClick={() => addToast("Konfigurasi template berhasil disimpan.")} className="btn-primary flex items-center gap-2">
          <Save size={14} /> Simpan Template
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Config panel */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-sm font-semibold text-[#172033] mb-4">Elemen Header</h3>
            <div className="space-y-3">
              <ConfigToggle label="Logo Perusahaan" checked={config.showLogo} onChange={() => toggle("showLogo")} />
              <ConfigToggle label="Tagline / Deskripsi" checked={config.showTagline} onChange={() => toggle("showTagline")} />
              <ConfigToggle label="Judul Invoice" checked={config.showInvoiceTitle} onChange={() => toggle("showInvoiceTitle")} />
              {config.showInvoiceTitle && (
                <input className="input w-full max-w-none" value={config.invoiceTitleText} onChange={e => setConfig(c => ({ ...c, invoiceTitleText: e.target.value }))} />
              )}
              <ConfigToggle label="Nomor Invoice" checked={config.showNomor} onChange={() => toggle("showNomor")} />
              <ConfigToggle label="Tanggal Invoice" checked={config.showTanggal} onChange={() => toggle("showTanggal")} />
              <ConfigToggle label="Tanggal Jatuh Tempo" checked={config.showJatuhTempo} onChange={() => toggle("showJatuhTempo")} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-sm font-semibold text-[#172033] mb-4">Elemen Konten</h3>
            <div className="space-y-3">
              <ConfigToggle label="Informasi Klien (Bill To)" checked={config.showKlien} onChange={() => toggle("showKlien")} />
              <ConfigToggle label="Tabel Item Invoice" checked={config.showItemTable} onChange={() => toggle("showItemTable")} />
              <ConfigToggle label="Subtotal" checked={config.showSubtotal} onChange={() => toggle("showSubtotal")} />
              <ConfigToggle label="Diskon" checked={config.showDiskon} onChange={() => toggle("showDiskon")} />
              <ConfigToggle label="Total Due" checked={config.showTotal} onChange={() => toggle("showTotal")} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5">
            <h3 className="text-sm font-semibold text-[#172033] mb-4">Elemen Footer</h3>
            <div className="space-y-3">
              <ConfigToggle label="Informasi Rekening Bank" checked={config.showBankInfo} onChange={() => toggle("showBankInfo")} />
              <ConfigToggle label="Terms & Conditions" checked={config.showTerms} onChange={() => toggle("showTerms")} />
              <ConfigToggle label="Cap Perusahaan" checked={config.showStamp} onChange={() => toggle("showStamp")} />
              <ConfigToggle label="Tanda Tangan" checked={config.showSignature} onChange={() => toggle("showSignature")} />
              <ConfigToggle label="Nama Penanda Tangan" checked={config.showSignerName} onChange={() => toggle("showSignerName")} />
              <ConfigToggle label="Jabatan Penanda Tangan" checked={config.showSignerPosition} onChange={() => toggle("showSignerPosition")} />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="xl:col-span-3 min-w-0">
          <div className="sticky top-6">
            <div className="text-xs text-[#667085] mb-2 text-center">Preview (Skala 75%)</div>
            <div className="bg-[#E8EAED] rounded-lg p-4 overflow-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
              <div className="bg-white mx-auto shadow" style={{ width: "100%", maxWidth: 540, fontSize: 9, padding: "30px 36px", fontFamily: "Inter, sans-serif" }}>
                {/* Mini invoice preview */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  {config.showLogo && <DevspaceLogo size={24} compact />}
                  {config.showTagline && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, fontSize: 8, color: "#172033" }}>Professional & Valuable Digital Transformation</div>
                      <div style={{ fontSize: 7, color: "#667085" }}>www.ruangkreasi.co.id | info@ruangkreasi.co.id</div>
                    </div>
                  )}
                </div>
                <div style={{ borderTop: "1px solid #E2E6EC", marginBottom: 16 }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 8, color: "#667085" }}>Invoice Name : Project Spiritra</div>
                    <div style={{ fontSize: 8, color: "#667085" }}>Invoice Date : 1 Agustus 2026</div>
                    <div style={{ fontSize: 8, color: "#667085" }}>Due Date : 15 Agustus 2026</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 130, maxWidth: 160 }}>
                    {config.showInvoiceTitle && <div style={{ fontSize: 16, fontWeight: 800, color: "#172033", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{config.invoiceTitleText}</div>}
                    {config.showNomor && <div style={{ fontSize: 8, color: "#667085", whiteSpace: "nowrap" }}>No. 001/INV/RKA/VIII/26</div>}
                  </div>
                </div>
                {config.showKlien && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 8, color: "#172033", marginBottom: 4 }}>Bill To:</div>
                    <div style={{ fontSize: 8, color: "#172033" }}>Graha Indonesia Telekomunika</div>
                    <div style={{ fontSize: 7, color: "#667085" }}>Jl. Kembar I No.53, Bandung</div>
                  </div>
                )}
                {config.showItemTable && (
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8, fontSize: 7 }}>
                    <thead><tr style={{ background: "#F9FAFB" }}>
                      <th style={{ border: "1px solid #E2E6EC", padding: "4px 6px", textAlign: "left" }}>Item Description</th>
                      <th style={{ border: "1px solid #E2E6EC", padding: "4px 6px", textAlign: "right", width: 60 }}>Price</th>
                      <th style={{ border: "1px solid #E2E6EC", padding: "4px 6px", textAlign: "center", width: 24 }}>Qty</th>
                      <th style={{ border: "1px solid #E2E6EC", padding: "4px 6px", textAlign: "right", width: 60 }}>Total</th>
                    </tr></thead>
                    <tbody><tr>
                      <td style={{ border: "1px solid #E2E6EC", padding: "4px 6px" }}>Pembayaran Ke-2 Pelunasan Project Spiritra</td>
                      <td style={{ border: "1px solid #E2E6EC", padding: "4px 6px", textAlign: "right" }}>Rp 3.000.000</td>
                      <td style={{ border: "1px solid #E2E6EC", padding: "4px 6px", textAlign: "center" }}>1</td>
                      <td style={{ border: "1px solid #E2E6EC", padding: "4px 6px", textAlign: "right" }}>Rp 3.000.000</td>
                    </tr></tbody>
                  </table>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <div style={{ width: 180, fontSize: 7 }}>
                    {config.showSubtotal && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ color: "#667085" }}>Subtotal</span><span>Rp 3.000.000</span></div>}
                    {config.showDiskon && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ color: "#667085" }}>Discount</span><span>0</span></div>}
                    {config.showTotal && <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: "1px solid #172033", fontWeight: 700 }}><span>Total Due</span><span>Rp 3.000.000</span></div>}
                  </div>
                </div>
                {config.showBankInfo && (
                  <div style={{ fontSize: 7, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>Payment Method:</div>
                    <div style={{ fontWeight: 700 }}>BCA 1394 5494 63</div>
                  </div>
                )}
                {config.showTerms && (
                  <div style={{ fontSize: 7, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>Terms & Condition:</div>
                    <div>• Silahkan lakukan pembayaran ke rekening yang tertera</div>
                  </div>
                )}
                {(config.showSignature || config.showStamp) && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ textAlign: "center", position: "relative", minWidth: 100 }}>
                      <div style={{ fontSize: 7, marginBottom: 20 }}>Hormat kami,</div>
                      {config.showSignature && (
                        <svg width="80" height="25" viewBox="0 0 80 25" style={{ display: "block", margin: "0 auto" }} aria-label="Tanda tangan">
                          <path d="M4 18 C12 3, 20 22, 30 14 C37 8, 40 19, 49 14 C56 10, 61 17, 73 9" fill="none" stroke="#172033" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      )}
                      {config.showSignature && <div style={{ borderBottom: "1px solid #172033", width: 80, margin: "0 auto 4px" }} />}
                      {config.showSignerName && <div style={{ fontSize: 7, fontWeight: 700 }}>Admin Keuangan</div>}
                      {config.showSignerPosition && <div style={{ fontSize: 6, color: "#667085" }}>PT. Ruang Kreasi Aplikasi</div>}
                      {config.showStamp && (
                        <svg width="48" height="48" viewBox="0 0 48 48" style={{ position: "absolute", right: -16, top: 10, opacity: 0.75 }} aria-label="Cap perusahaan">
                          <circle cx="24" cy="24" r="22" fill="none" stroke="#1E3A6E" strokeWidth="1.6" />
                          <circle cx="24" cy="24" r="17" fill="none" stroke="#1E3A6E" strokeWidth="0.7" />
                          <text x="24" y="22" textAnchor="middle" fontSize="5" fontWeight="700" fill="#1E3A6E">DEVSPACE</text>
                          <text x="24" y="29" textAnchor="middle" fontSize="3.7" fill="#1E3A6E">PT. RKA</text>
                        </svg>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#172033]">{label}</span>
      <button
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-[#173B6C]" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${checked ? "translate-x-4" : "translate-x-1"}`} />
      </button>
    </div>
  );
}
