import Modal from "./Modal";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({ open, title, message, confirmLabel = "Konfirmasi", cancelLabel = "Kembali", onConfirm, onCancel, danger = false }: Props) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width="max-w-md"
      footer={
        <>
          <button onClick={onCancel} className="btn-secondary">{cancelLabel}</button>
          <button onClick={onConfirm} className={`${danger ? "btn-danger" : "btn-primary"}`}>{confirmLabel}</button>
        </>
      }
    >
      <p className="text-sm text-[#667085]">{message}</p>
    </Modal>
  );
}
