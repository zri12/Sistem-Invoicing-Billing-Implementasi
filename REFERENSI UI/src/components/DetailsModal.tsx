import Modal from "@/components/Modal";

export interface DetailField {
  label: string;
  value: string | number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: DetailField[];
}

export default function DetailsModal({ open, onClose, title, subtitle, fields }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={<button onClick={onClose} className="btn-primary">Tutup</button>}
    >
      {subtitle && <p className="text-sm text-[#667085] mb-4">{subtitle}</p>}
      <dl className="divide-y divide-[#E2E6EC] rounded-lg border border-[#E2E6EC] overflow-hidden">
        {fields.map(field => (
          <div key={field.label} className="grid grid-cols-2 gap-4 px-4 py-3">
            <dt className="text-sm text-[#667085]">{field.label}</dt>
            <dd className="text-sm font-medium text-[#172033] text-right break-words">{field.value || "-"}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
