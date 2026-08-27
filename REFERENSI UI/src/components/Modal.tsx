import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}

export default function Modal({ open, onClose, title, children, width = "max-w-lg", footer }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${width} mx-3 sm:mx-4 flex flex-col max-h-[calc(100vh-1.5rem)] sm:max-h-[90vh]`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E6EC] flex-shrink-0">
          <h2 className="text-base font-semibold text-[#172033]">{title}</h2>
          <button onClick={onClose} className="text-[#667085] hover:text-[#172033] p-1 rounded"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5">{children}</div>
        {footer && (
          <div className="px-4 sm:px-6 py-4 border-t border-[#E2E6EC] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 flex-shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}
