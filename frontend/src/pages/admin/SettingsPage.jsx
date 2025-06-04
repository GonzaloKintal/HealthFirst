import { FiSettings } from 'react-icons/fi';
import DepartmentsSection from '../../components/settings/DepartmentsSection';
import TelegramNotification from '../../components/settings/TelegramNotification';
import useAuth from '../../hooks/useAuth';

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
          <FiSettings className="mr-2" />
          Configuración del Sistema
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Departamentos */}
        {user?.role === 'admin' && (
          <div className="lg:col-span-2">
            <DepartmentsSection />
          </div>
        )}
        
        {/* Sección para activar Telegram */}
        <div className="bg-background p-6 rounded-lg shadow">
          <TelegramNotification />
        </div>
        
        {/* Otras secciones de configuración que vayamos a tener */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-foreground mb-4">Otra sección</h2>
          <p className="text-foreground">Contenido pendiente...</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;