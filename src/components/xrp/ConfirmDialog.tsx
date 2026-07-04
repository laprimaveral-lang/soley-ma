import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-red-500">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-black">{title}</h2>
          </div>
          <p className="text-gray-600 mb-8">{message}</p>
          <div className="flex gap-3 justify-end">
            <button type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
