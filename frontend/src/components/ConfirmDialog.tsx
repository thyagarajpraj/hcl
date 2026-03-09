interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmDialogProps) {
  console.log("ConfirmDialog isOpen:", isOpen);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 max-w-sm shadow-xl">
        <h2 className="text-xl font-bold mb-2 text-gray-900">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
