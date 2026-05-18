interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export function ConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div style={{ backgroundColor: '#F5F5F5' }} className="rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-hm-dark mb-3">{title}</h2>
        <p className="text-sm text-hm-dark mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D84545')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C41E3A')}
            style={{ backgroundColor: '#C41E3A' }}
            className="flex-1 text-white font-bold py-2 px-4 rounded-lg transition-all cursor-pointer"
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-hm-dark font-semibold py-2 px-4 rounded-lg transition-all cursor-pointer"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
