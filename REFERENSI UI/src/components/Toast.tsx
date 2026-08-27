import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface Props {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle size={16} className="text-green-600 flex-shrink-0" />,
    error: <XCircle size={16} className="text-red-500 flex-shrink-0" />,
    info: <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />,
  };

  const colors = {
    success: "border-l-green-500",
    error: "border-l-red-500",
    info: "border-l-blue-500",
  };

  return (
    <div className={`flex items-center gap-3 bg-white rounded-lg shadow-lg border border-[#E2E6EC] border-l-4 ${colors[toast.type]} px-4 py-3 min-w-[280px] max-w-sm`}>
      {icons[toast.type]}
      <span className="text-sm text-[#172033] flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-[#667085] hover:text-[#172033] ml-1"><X size={14} /></button>
    </div>
  );
}
