
import { FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useEffect } from 'react';

const Notification = ({ type, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700',
    error: 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700'
  };

  const textColor = {
    success: 'text-green-800 dark:text-green-100',
    warning: 'text-yellow-800 dark:text-yellow-100',
    error: 'text-red-800 dark:text-red-100'
  };

  const iconColor = {
    success: 'text-green-500 dark:text-green-300',
    warning: 'text-yellow-500 dark:text-yellow-300',
    error: 'text-red-500 dark:text-red-300'
  };

  const icon = {
    success: <FiCheck className={iconColor.success} />,
    warning: <FiAlertTriangle className={iconColor.warning} />,
    error: <FiAlertTriangle className={iconColor.error} />
  };

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 border rounded-md p-4 ${bgColor[type]} ${textColor[type]} shadow-lg max-w-md w-[95%] sm:w-full animate-fade-in dark:shadow-lg dark:shadow-black/30`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5 mr-3">
          {icon[type]}
        </div>
        <div className="flex-1">
          <p className="font-medium">
            {type === 'success' ? 'Éxito' : type === 'warning' ? 'Advertencia' : 'Error'}
          </p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-foreground dark:text-gray-300 dark:hover:text-gray-100"
          aria-label="Cerrar notificación"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default Notification;