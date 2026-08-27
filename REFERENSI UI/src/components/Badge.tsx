import type { StatusDokumen, StatusPembayaran } from "@/data/mock";

const dokumenConfig: Record<StatusDokumen, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600 border border-gray-200" },
  diterbitkan: { label: "Diterbitkan", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  dibatalkan: { label: "Dibatalkan", className: "bg-red-50 text-red-600 border border-red-200" },
};

const pembayaranConfig: Record<StatusPembayaran, { label: string; className: string }> = {
  belum_dibayar: { label: "Belum Dibayar", className: "bg-slate-100 text-slate-600 border border-slate-200" },
  dibayar_sebagian: { label: "Dibayar Sebagian", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  lunas: { label: "Lunas", className: "bg-green-50 text-green-700 border border-green-200" },
  jatuh_tempo: { label: "Jatuh Tempo", className: "bg-red-50 text-red-600 border border-red-200" },
};

const userStatusConfig: Record<string, { label: string; className: string }> = {
  aktif: { label: "Aktif", className: "bg-green-50 text-green-700 border border-green-200" },
  nonaktif: { label: "Nonaktif", className: "bg-gray-100 text-gray-500 border border-gray-200" },
};

export function StatusDokumenBadge({ status }: { status: StatusDokumen }) {
  const cfg = dokumenConfig[status];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
}

export function StatusPembayaranBadge({ status }: { status: StatusPembayaran }) {
  const cfg = pembayaranConfig[status];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = userStatusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-500 border border-gray-200" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
}
