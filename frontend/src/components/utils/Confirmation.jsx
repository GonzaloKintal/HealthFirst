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
      bg: 'bg-yellow-50',
      icon: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    danger: {
      bg: 'bg-red-50',
      icon: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.warning;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10500"></div>
      
      <div className="fixed inset-0 flex items-center justify-center z-11000 p-4">
        <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${currentStyle.bg}`}>
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${currentStyle.bg} sm:mx-0 sm:h-10 sm:w-10`}>
                <FiAlertTriangle className={`h-6 w-6 ${currentStyle.icon}`} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">{title}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-1">
            <button
              type="button"
              className={`w-full cursor-pointer inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-white text-base font-medium focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${currentStyle.button}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 cursor-pointer w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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