import { FiBarChart2, FiDownload, FiFilter } from 'react-icons/fi';
import  useAuth from '../../hooks/useAuth';

const MetricsPage = ({ activeTab }) => {
  const { user } = useAuth();
  
  // Datos de ejemplo para las métricas
  const metricsData = [
    { name: 'Licencias aprobadas', value: 124, change: '+12%', trend: 'up' },
    { name: 'Licencias rechazadas', value: 18, change: '-5%', trend: 'down' },
    { name: 'Tiempo promedio de aprobación', value: '2.3 días', change: '-0.5 días', trend: 'down' },
    { name: 'Solicitudes pendientes', value: 23, change: '+3', trend: 'up' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-foreground">
          <FiBarChart2 className="mr-2" />
          Métricas {user?.role === 'admin'}
        </h1>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-background border border-border rounded-md shadow-sm font-medium text-foreground hover:bg-card cursor-pointer transition duration-200">
            <FiFilter className="mr-2" />
            Filtrar
          </button>
          <button className="flex items-center px-4 py-2 bg-primary rounded-md shadow-sm font-medium text-white hover:bg-primary-hover cursor-pointer transition duration-200">
            <FiDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsData.map((metric, index) => (
            <div key={index} className="bg-background p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-foreground">{metric.name}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-semibold text-foreground">{metric.value}</span>
                <span 
                  className={`ml-2 text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-background p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Tendencias mensuales</h2>
        <div className="h-64 bg-card rounded-md flex items-center justify-center text-gray-400">
          [Gráfico de tendencias - Área para visualización de datos]
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;