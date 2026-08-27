import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  total: number;
  perPage?: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, total, perPage = 10, onChange }: Props) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E6EC]">
      <span className="text-xs text-[#667085]">Menampilkan {from}–{to} dari {total} data</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="p-1.5 rounded text-[#667085] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pg = i + 1;
          return (
            <button key={pg} onClick={() => onChange(pg)} className={`w-7 h-7 rounded text-xs ${pg === page ? "bg-[#173B6C] text-white" : "text-[#667085] hover:bg-gray-100"}`}>
              {pg}
            </button>
          );
        })}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="p-1.5 rounded text-[#667085] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
