import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Modal de confirmação customizado para substituir window.confirm()
 * Uso:
 * const [showConfirm, setShowConfirm] = useState(false);
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   title="Confirmar exclusão"
 *   message="Tem certeza que deseja excluir a empresa 'Teste'?"
 *   onConfirm={() => { handleDelete(); setShowConfirm(false); }}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
const ConfirmDialog = ({
  isOpen,
  title = "Confirmar ação",
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger" // "danger" | "warning" | "info"
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    info: {
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
    }
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
        {/* Header com ícone */}
        <div className="flex items-start p-6 pb-4">
          <div className={`flex-shrink-0 ${styles.iconBg} rounded-full p-3`}>
            <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
