import { FiSettings } from 'react-icons/fi';

const SettingsPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-foreground">
          <FiSettings className="mr-2" />
          Configuración del Sistema
        </h1>
      </div>

      <div className="bg-background p-6 rounded-lg shadow">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-medium text-foreground mb-2">Coming soon...</h2>
            <p className="text-foreground">
              Esta sección estará disponible en una próxima versión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;