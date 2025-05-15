import { useState, useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const Confirmation = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning" // 'warning', 'danger', 'info'
}) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isOpen || !isBrowser) return null;

  const typeStyles = {
    warning: {
      icon: 'text-yellow-500 dark:text-yellow-400',
      button: 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white'
    },
    danger: {
      icon: 'text-red-500 dark:text-red-400',
      button: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white'
    },
    info: {
      icon: 'text-blue-500 dark:text-blue-400',
      button: 'bg-primary hover:bg-primary-hover text-white'
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.warning;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10500"></div>
      
      <div className="fixed inset-0 flex items-center justify-center z-11000 p-4">
        <div className="bg-background rounded-lg shadow-xl max-w-md w-full border border-border">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-background sm:mx-0 sm:h-10 sm:w-10">
                <FiAlertTriangle className={`h-6 w-6 ${currentStyle.icon}`} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-foreground">{title}</h3>
              <div className="mt-2">
                <p className="text-sm text-foreground dark:text-foreground">{message}</p>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-1">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md px-4 py-2 text-base font-medium shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${currentStyle.button}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-border px-4 py-2 bg-background text-base font-medium text-foreground shadow-sm hover:bg-card focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Confirmation;