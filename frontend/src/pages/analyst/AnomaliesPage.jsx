import { useState } from 'react';
import { FiCpu, FiAlertTriangle } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const AnomaliesPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-foreground">
          <FiAlertTriangle className="mr-2" />
          Anomalías
        </h1>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-6 p-4 bg-special-light dark:bg-special-dark border-l-4 border-primary-border rounded">
          <p className="text-primary-text">
            <strong className="text-primary-text">Nota:</strong> Como administrador, tendrás acceso a configuraciones avanzadas 
            de detección de anomalías cuando esta sección esté disponible.
          </p>
        </div>
      )}

      <div className="mt-6 bg-background rounded-lg shadow p-6">
        <div className="text-center py-12">
          <FiCpu className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-foreground">
            Coming soon...
          </h3>
          <p className="mt-1 text-sm text-foreground">
            Estamos trabajando en esta funcionalidad. ¡Vuelve pronto!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnomaliesPage;