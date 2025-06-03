import { useState } from 'react';
import { FiDownload, FiMessageSquare, FiSend, FiCheckCircle } from 'react-icons/fi';

const TelegramNotifications = () => {
  const [telegramId, setTelegramId] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para guardar el ID en el 
    console.log("Telegram ID registrado:", telegramId);
    setIsVerified(true);
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
              className="w-full max-w-xs px-3 py-2 border border-border rounded-md text-base bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: 123456789"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md text-base"
            disabled={isVerified}
          >
            {isVerified ? 'ID Registrado' : 'Registrar ID'}
          </button>
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
      <h3 className="text-lg font-medium text-foreground mb-2">Configurar notificaciones por Telegram</h3>
      <p className="text-base text-foreground mb-6">Sigue estos pasos para recibir notificaciones en tu dispositivo</p>

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
    </div>
  );
};

export default TelegramNotifications;