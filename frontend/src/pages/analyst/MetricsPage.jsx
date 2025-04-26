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
        <h1 className="text-2xl font-bold flex items-center">
          <FiBarChart2 className="mr-2" />
          Métricas {user?.role === 'admin' && '(Vista Analista)'}
        </h1>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition duration-200">
            <FiFilter className="mr-2" />
            Filtrar
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 rounded-md shadow-sm font-medium text-white hover:bg-blue-700 cursor-pointer transition duration-200">
            <FiDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsData.map((metric, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-500">{metric.name}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-semibold text-gray-900">{metric.value}</span>
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

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tendencias mensuales</h2>
        <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center text-gray-400">
          [Gráfico de tendencias - Área para visualización de datos]
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-yellow-700">
            <strong>Nota:</strong> Estás viendo esta página con privilegios de administrador.
            Algunas funciones analíticas avanzadas pueden estar limitadas.
          </p>
        </div>
      )}
    </div>
  );
};

export default MetricsPage;