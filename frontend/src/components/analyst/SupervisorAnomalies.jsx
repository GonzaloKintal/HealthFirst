
import { useState, useEffect } from 'react';
import { FiRefreshCw, FiPieChart, FiUser, FiBarChart2, FiFilter, FiX, FiActivity } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { getSupervisorAnomalies } from '../../services/licenseService';
import { getUsers } from '../../services/userService';
import StyledDatePicker from '../utils/StyledDatePicker';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const SupervisorAnomalies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [anomaliesData, setAnomaliesData] = useState(null);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    user_id: '',
    is_anomaly: ''
  });

  // Detectar modo oscuro
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleAnalyzeAnomalies = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Primero cargar los supervisores si no están cargados
      if (supervisors.length === 0) {
        setIsLoading(true);
        const response = await getUsers(1, '', 'supervisor');
        setSupervisors(response.users || []);
        setIsLoading(false);
      }

      // Luego cargar las anomalías con los filtros
      const result = await getSupervisorAnomalies({
        start_date: filters.start_date ? filters.start_date.toISOString().split('T')[0] : null,
        end_date: filters.end_date ? filters.end_date.toISOString().split('T')[0] : null,
        user_id: filters.user_id || null,
        is_anomaly: filters.is_anomaly || null
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al analizar anomalías');
      }

      const transformedData = transformApiData(result.data);
      setAnomaliesData(transformedData);
      setHasAnalyzed(true);
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing anomalies:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Transformar datos de la API al formato esperado
  const transformApiData = (apiData) => {
    return apiData.map(item => ({
      evaluator_id: item.evaluator_id,
      total_requests: item.total_requests,
      approved_requests: item.approved_requests,
      rejected_requests: item.rejected_requests,
      approval_rate: parseFloat(item.approval_rate) || 0,
      rejection_rate: parseFloat(item.rejection_rate) || 0,
      is_anomaly: item.is_anomaly
    }));
  };

  // Obtener nombre del supervisor por ID
  const getNameById = (id) => {
    if (isLoading) return 'Cargando...';
    if (error) return `Supervisor (ID: ${id})`;
    
    const supervisor = supervisors.find(s => s.id === id);
    if (!supervisor) {
      console.warn(`Supervisor con ID ${id} no encontrado`);
      return `Supervisor (ID: ${id})`;
    }
    return supervisor.full_name;
  };

  // Obtener departamento del supervisor por ID
  const getDepartmentById = (id) => {
    const supervisor = supervisors.find(s => s.id === id);
    return supervisor?.department || 'Sin departamento';
  };

  // Datos para los gráficos
  const getChartData = () => {
    if (!anomaliesData) return null;
    
    const anomalyCount = anomaliesData.reduce((acc, item) => {
      acc[item.is_anomaly ? 'Anomalías' : 'Normales']++;
      return acc;
    }, { 'Anomalías': 0, 'Normales': 0 });

    const approvalRates = anomaliesData.map(item => ({
      name: getNameById(item.evaluator_id),
      rate: item.approval_rate
    })).sort((a, b) => b.rate - a.rate);

    return {
      anomalyDistribution: {
        labels: ['Normales', 'Anomalías'],
        datasets: [
          {
            data: [anomalyCount.Normales, anomalyCount.Anomalías],
            backgroundColor: ['#3B82F6', '#EF4444'],
            borderColor: ['#2563EB', '#DC2626'],
            borderWidth: 1,
          },
        ],
      },
      approvalRates: {
        labels: approvalRates.map(item => item.name),
        datasets: [
          {
            label: 'Tasa de Aprobación (%)',
            data: approvalRates.map(item => item.rate),
            backgroundColor: '#3B82F6',
            borderColor: '#1D4ED8',
            borderWidth: 1,
          },
        ],
      },
    };
  };

  // Opciones para los gráficos
  const getChartOptions = (isPie = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#ffffff' : '#1f2937',
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(249, 250, 251, 0.95)',
        titleColor: isDarkMode ? '#f3f4f6' : '#1f2937',
        bodyColor: isDarkMode ? '#f3f4f6' : '#1f2937',
        borderColor: isDarkMode ? '#6b7280' : '#e5e7eb',
        borderWidth: 2,
        displayColors: true,
        bodyFont: {
          weight: 'bold',
        },
        callbacks: isPie ? {
          label: function(context) {
            return `${context.label}: ${context.raw} (${Math.round(context.parsed)}%)`;
          }
        } : undefined
      },
    },
    ...(isPie ? {
      elements: {
        arc: {
          borderWidth: isDarkMode ? 2 : 1,
          borderColor: isDarkMode ? '#111827' : '#ffffff',
        }
      }
    } : {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Porcentaje (%)',
            color: isDarkMode ? '#ffffff' : '#1f2937',
          },
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: isDarkMode ? '#ffffff' : '#1f2937',
          },
        },
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
            color: isDarkMode ? '#ffffff' : '#1f2937',
          },
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
      }
    })
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const resetFilters = () => {
    setFilters({
      start_date: null,
      end_date: null,
      user_id: '',
      is_anomaly: ''
    });
  };

  const applyFilters = () => {
    setShowFilters(false);
    if (hasAnalyzed) {
      handleAnalyzeAnomalies();
    }
  };

  const chartData = getChartData();

  return (
    <div className="pt-2">
      <div className="flex justify-between items-start mt-4 gap-4">
        <button
          onClick={handleAnalyzeAnomalies}
          disabled={isAnalyzing || hasAnalyzed}
          className={`px-4 py-2 rounded-md flex items-center ${
            isAnalyzing || hasAnalyzed
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
          }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analizando...
            </>
          ) : (
            <>
              <FiRefreshCw className="mr-2" />
              Analizar supervisores
            </>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={!hasAnalyzed}
            className={`px-4 py-2 rounded-md flex items-center border ${
              hasAnalyzed
                ? 'bg-card dark:bg-card-dark text-foreground dark:text-foreground-dark hover:bg-card-hover dark:hover:bg-card-hover-dark border-border dark:border-border-dark cursor-pointer'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
            }`}
          >
            <FiFilter className="mr-2" />
            Filtros
            {hasAnalyzed && Object.values(filters).some(val => val !== '' && val !== null) && (
              <span className="ml-2 w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>

          {showFilters && hasAnalyzed && (
            <div className="absolute right-0 mt-2 w-72 bg-card dark:bg-card-dark rounded-lg shadow-lg border border-border dark:border-border-dark z-10 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-foreground dark:text-foreground-dark">Filtrar resultados</h3>
                <button onClick={() => setShowFilters(false)} className="text-foreground dark:text-muted-foreground-dark">
                  <FiX />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground dark:text-foreground-dark">Supervisor</label>
                  <select
                    name="user_id"
                    value={filters.user_id}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-border dark:border-border-dark rounded bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark"
                  >
                    <option value="">Todos los supervisores</option>
                    {supervisors.map(supervisor => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground dark:text-foreground-dark">Estado</label>
                  <select
                    name="is_anomaly"
                    value={filters.is_anomaly}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-border dark:border-border-dark rounded bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark"
                  >
                    <option value="">Todos</option>
                    <option value="true">Solo anomalías</option>
                    <option value="false">Solo normales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground dark:text-foreground-dark">Fecha desde</label>
                  <StyledDatePicker
                    selected={filters.start_date}
                    onChange={(date) => handleDateChange(date, 'start_date')}
                    selectsStart
                    startDate={filters.start_date}
                    endDate={filters.end_date}
                    placeholderText="Seleccione fecha"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground dark:text-foreground-dark">Fecha hasta</label>
                  <StyledDatePicker
                    selected={filters.end_date}
                    onChange={(date) => handleDateChange(date, 'end_date')}
                    selectsEnd
                    startDate={filters.start_date}
                    endDate={filters.end_date}
                    minDate={filters.start_date}
                    placeholderText="Seleccione fecha"
                    className="w-full"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1 text-sm text-foreground dark:hover:text-foreground-dark"
                  >
                    Limpiar filtros
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-hover"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {anomaliesData ? (
        <>
          <div className="mt-6 bg-background dark:bg-background-dark rounded-lg shadow overflow-hidden border border-border dark:border-border-dark">
            <div 
              className="overflow-x-auto overflow-y-auto" 
              style={{ 
                maxHeight: 'calc(100vh - 500px)',
                minHeight: '400px'
              }}
            >
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead className="bg-card dark:bg-card-dark sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                      Evaluaciones
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                      Aprobadas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                      Rechazadas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                      Tasa Aprobación
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                      Es Anomalía
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background dark:bg-background-dark divide-y divide-border dark:divide-border-dark overflow-y-auto">
                  {anomaliesData.map((item, index) => (
                    <tr key={index} className="hover:bg-card dark:hover:bg-card-dark">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                        <div className="font-medium">{getNameById(item.evaluator_id)}</div>
                        {!isLoading && !error && (
                          <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                            {getDepartmentById(item.evaluator_id)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                        {item.total_requests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                        {item.approved_requests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                        {item.rejected_requests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                        {item.approval_rate.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.is_anomaly 
                            ? 'bg-red-100 text-red-800 dark:bg-red-600/50 dark:text-red-100' 
                            : 'bg-green-100 text-green-800 dark:bg-green-600/50 dark:text-green-100'
                        }`}>
                          {item.is_anomaly ? 'Sí' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center mb-4 text-foreground dark:text-foreground-dark">
                <FiPieChart className="mr-2 text-primary-text dark:text-primary-text-dark" />
                <h3 className="font-medium">Distribución de Anomalías</h3>
              </div>
              <div className="h-64">
                <Pie 
                  data={chartData.anomalyDistribution}
                  options={getChartOptions(true)}
                />
              </div>
            </div>

            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center mb-4 text-foreground dark:text-foreground-dark">
                <FiBarChart2 className="mr-2 text-primary-text dark:text-primary-text-dark" />
                <h3 className="font-medium">Tasas de Aprobación</h3>
              </div>
              <div className="h-64">
                <Bar
                  data={chartData.approvalRates}
                  options={getChartOptions()}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 bg-background dark:bg-background-dark rounded-lg shadow p-6 border border-border dark:border-border-dark">
          <div className="text-center py-12">
            <FiUser className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-foreground dark:text-foreground-dark">
              Análisis de supervisores
            </h3>
            <p className="mt-1 text-sm text-foreground dark:text-foreground-dark">
              Presiona el botón "Analizar supervisores" para evaluar los patrones de aprobación.
            </p>
            {isLoading && (
              <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                Cargando información de supervisores...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorAnomalies;