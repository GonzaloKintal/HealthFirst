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
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200'
  };

  const textColor = {
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800'
  };

  const icon = {
    success: <FiCheck className="text-green-500" />,
    warning: <FiAlertTriangle className="text-yellow-500" />,
    error: <FiAlertTriangle className="text-red-500" />
  };

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 border rounded-md p-4 ${bgColor[type]} ${textColor[type]} shadow-lg max-w-md w-[95%] sm:w-full animate-fade-in`}>
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
          className="ml-4 text-gray-400 hover:text-foreground"
          aria-label="Cerrar notificación"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default Notification;