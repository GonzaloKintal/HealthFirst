

import { useState, useEffect } from 'react';
import { FiDownload, FiMessageSquare, FiSend, FiCheckCircle, FiBell, FiTrash2 } from 'react-icons/fi';
import { addTelegramSubscription, removeTelegramSubscription, getTelegramSubscription } from '../../services/userService';
import useAuth from '../../hooks/useAuth';
import Confirmation from '../utils/Confirmation';
import Notification from '../utils/Notification';
const TelegramNotifications = () => {
  const { user } = useAuth();
  const [telegramId, setTelegramId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showRegisterConfirmation, setShowRegisterConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Verificar estado de suscripción al cargar el componente
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        const status = await getTelegramSubscription(user.id);
        if (status.isSubscribed) {
          setIsVerified(true);
          setTelegramId(status.telegramId || '');
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError('Error al verificar el estado de suscripción');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      checkSubscription();
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowRegisterConfirmation(true);
  };

  const confirmRegister = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await addTelegramSubscription(user.id, telegramId);
      setIsVerified(true);
      showNotification('success', 'ID de Telegram registrado correctamente');
    } catch (err) {
      console.error('Error registering Telegram ID:', err);
      setError(err.response?.data?.error || 'Error al registrar el ID de Telegram');
      showNotification('error', 'Error al registrar el ID de Telegram');
    } finally {
      setIsLoading(false);
      setShowRegisterConfirmation(false);
    }
  };

  const handleRemoveSubscription = () => {
    setShowDeleteConfirmation(true);
  };

   const confirmDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await removeTelegramSubscription(user.id);
      setIsVerified(false);
      setTelegramId('');
      showNotification('success', 'Suscripción eliminada correctamente');
    } catch (err) {
      console.error('Error removing Telegram subscription:', err);
      setError(err.response?.data?.error || 'Error al eliminar la suscripción');
      showNotification('error', 'Error al eliminar la suscripción');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const steps = [
    {
      title: "1. Descargar Telegram",
      description: "Instala la aplicación Telegram en tu dispositivo",
      icon: <FiDownload className="text-blue-500" />,
      content: (
        <div className="flex flex-row flex-wrap md:flex-nowrap items-start justify-start mt-2 gap-2">
          <a 
            href="https://apps.apple.com/app/telegram-messenger/id686449807"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img 
                src="/images/telegram/appstore.png" 
                alt="App Store" 
                className="w-36 h-auto" 
            />
          </a>
          <a 
            href="https://play.google.com/store/apps/details?id=org.telegram.messenger"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img 
                src="/images/telegram/googleplay.png" 
                alt="Google Play" 
                className="w-36 h-auto" 
            />
          </a>
        </div>
      )
    },
    {
      title: "2. Obtener tu ID",
      description: "Envía un mensaje a @userinfobot para conocer tu ID",
      icon: <FiMessageSquare className="text-green-500" />,
      content: (
        <div className="mt-2">
          <a
            href="https://t.me/userinfobot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-[#0088cc] text-white rounded-lg text-base mb-2"
          >
            Abrir @userinfobot
          </a>
          <p className="text-sm mt-1 text-foreground">El bot te responderá con tu ID numérico</p>
        </div>
      )
    },
    {
      title: "3. Registrar tu ID",
      description: "Ingresa tu ID de Telegram en nuestro sistema",
      icon: <FiSend className="text-purple-500" />,
      content: (
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="mb-3">
            <input
              type="text"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className={`w-full max-w-xs px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 ${
                isVerified || isLoading
                  ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed focus:ring-0'
                  : 'bg-background border-border text-foreground focus:ring-primary'
              }`}
              placeholder="Ej: 123456789"
              required
              disabled={isVerified || isLoading}
            />
          </div>
          {isVerified ? (
            <button
              type="button"
              onClick={handleRemoveSubscription}
              className="px-4 py-2 bg-red-500 text-white rounded-md text-base flex items-center gap-2"
              disabled={isLoading}
            >
              <FiTrash2 /> Eliminar suscripción
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md text-base"
              disabled={isVerified || isLoading}
            >
              {isLoading ? 'Procesando...' : 'Registrar ID'}
            </button>
          )}
        </form>
      )
    },
    {
      title: "4. Activar notificaciones",
      description: "Envía /start a nuestro bot para finalizar",
      icon: <FiCheckCircle className="text-teal-500" />,
      content: (
        <div className="mt-2">
          {isVerified ? (
            <>
              <a
                href="https://t.me/health_first_vox_dei_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-[#0088cc] text-white rounded-lg text-base mb-2"
              >
                Abrir @voxdeibot
              </a>
              <div className="flex items-center gap-1 text-green-500 text-base">
                <FiCheckCircle /> Configuración completada
              </div>
            </>
          ) : (
            <p className="text-sm text-foreground">
              Primero registra tu ID para activar las notificaciones
            </p>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium text-foreground mb-2">
        <FiBell className="inline-block mr-2" />
        Configurar notificaciones por Telegram
      </h3>
      <p className="text-base text-foreground mb-6">Sigue estos pasos para recibir notificaciones en tu dispositivo</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {steps.map((step, index) => (
            <div key={index} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                <div className="text-foreground">{step.icon}</div>
                <h4 className="font-medium text-base text-foreground">{step.title}</h4>
                </div>
                <p className="text-sm text-foreground">{step.description}</p>
                {step.content}
            </div>
        ))}
      </div>

      {/* Diálogos de confirmación */}
      <Confirmation
        isOpen={showRegisterConfirmation}
        onClose={() => setShowRegisterConfirmation(false)}
        onConfirm={confirmRegister}
        title="Registrar ID de Telegram"
        message="¿Estás seguro que deseas registrar este ID de Telegram para recibir notificaciones?"
        confirmText="Registrar"
        cancelText="Cancelar"
        type="info"
      />

      <Confirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Eliminar suscripción"
        message="¿Estás seguro que deseas dejar de recibir notificaciones por Telegram?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {notification.show && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default TelegramNotifications;