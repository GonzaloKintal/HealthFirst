
import { useState, useEffect } from 'react';
import { FiRefreshCw, FiUsers, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const EmployeeAnomalies = ({ 
  employees, 
  isLoadingData, 
  dataError,
  onAnalyzed,
  initialData,
  lastAnalyzed
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [employeesData, setEmployeesData] = useState(initialData || null);
    const [localLastAnalyzed, setLocalLastAnalyzed] = useState(lastAnalyzed || null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detectar cambio de modo oscuro/claro
    useEffect(() => {
        const checkDarkMode = () => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        // Verificar al montar
        checkDarkMode();

        // Observar cambios en el atributo class del html
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    // Datos de ejemplo para análisis
    const mockEmployeesAnalysis = [
        { employee_id: 101, total_requests: 12, avg_duration: 3.5, frequency: 1.2, anomaly_score: -0.145875, is_anomaly: 1 },
        { employee_id: 102, total_requests: 5, avg_duration: 2.0, frequency: 0.5, anomaly_score: 0.023364, is_anomaly: 0 },
        { employee_id: 103, total_requests: 8, avg_duration: 1.8, frequency: 0.8, anomaly_score: 0.015777, is_anomaly: 0 },
        { employee_id: 104, total_requests: 20, avg_duration: 4.2, frequency: 2.1, anomaly_score: -0.124747, is_anomaly: 1 },
        { employee_id: 105, total_requests: 3, avg_duration: 1.5, frequency: 0.3, anomaly_score: 0.018177, is_anomaly: 0 },
    ];

    const handleAnalyzeAnomalies = () => {
        setIsAnalyzing(true);
        
        setTimeout(() => {
        const analysisDate = new Date();
        setEmployeesData(mockEmployeesAnalysis);
        setLocalLastAnalyzed(analysisDate);
        setIsAnalyzing(false);
        onAnalyzed(mockEmployeesAnalysis, analysisDate);
        }, 1500);
    };

    // Obtener nombre del empleado por ID
    const getNameById = (id) => {
        if (isLoadingData) return 'Cargando...';
        if (dataError) return `Empleado (ID: ${id})`;
        
        const employee = employees.find(e => e.id === id);
        return employee ? employee.name : `Empleado (ID: ${id})`;
    };

    const formatLastAnalyzed = (date) => {
        if (!date) return '';
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year}, ${hours}:${minutes}hs`;
    };

    // Datos para los gráficos
    const getChartData = () => {
        if (!employeesData) return null;
        
        // Gráfico de distribución de anomalías
        const anomalyCount = employeesData.reduce((acc, item) => {
        acc[item.is_anomaly ? 'Anomalías' : 'Normales']++;
        return acc;
        }, { 'Anomalías': 0, 'Normales': 0 });

        // Gráfico de solicitudes por empleado
        const requestsByEmployee = employeesData.map(item => ({
        name: getNameById(item.employee_id),
        requests: item.total_requests
        })).sort((a, b) => b.requests - a.requests);

        return {
        anomalyDistribution: {
            labels: ['Normales', 'Anomalías'],
            datasets: [
            {
                data: [anomalyCount.Normales, anomalyCount.Anomalías],
                backgroundColor: ['#10B981', '#EF4444'],
                borderColor: ['#059669', '#DC2626'],
                borderWidth: 1,
            },
            ],
        },
        requestsByEmployee: {
            labels: requestsByEmployee.map(item => item.name),
            datasets: [
            {
                label: 'Total de Solicitudes',
                data: requestsByEmployee.map(item => item.requests),
                backgroundColor: '#3B82F6',
                borderColor: '#1D4ED8',
                borderWidth: 1,
            },
            ],
        },
        };
    };

    // Opciones para el gráfico de torta (Pie Chart)
    const getPieChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
        position: 'bottom',  // Cambiado de 'display: false' a position bottom
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
        callbacks: {
            label: function(context) {
            return `${context.label}: ${context.raw} (${Math.round(context.parsed)}%)`;
            }
        }
        },
    },
    elements: {
        arc: {
        borderWidth: isDarkMode ? 2 : 1,
        borderColor: isDarkMode ? '#111827' : '#ffffff',
        }
    }
  });

  // Opciones para el gráfico de barras (Bar Chart)
  const getBarChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(249, 250, 251, 0.9)',
        titleColor: isDarkMode ? '#ffffff' : '#1f2937',
        bodyColor: isDarkMode ? '#ffffff' : '#1f2937',
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Solicitudes',
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
    },
  });

  const chartData = employeesData ? getChartData() : null;

  return (
    <>
      <div className="flex justify-start mt-4">
        <button
          onClick={handleAnalyzeAnomalies}
          disabled={isAnalyzing || isLoadingData}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover flex items-center cursor-pointer disabled:bg-blue-500 dark:disabled:bg-blue-700"
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
              Analizar empleados
            </>
          )}
        </button>
      </div>

      {localLastAnalyzed && (
        <div className="mt-4 text-sm text-foreground dark:text-foreground-dark">
          Último análisis: {formatLastAnalyzed(localLastAnalyzed)}
        </div>
      )}

      {employeesData ? (
        <div className="mt-6 bg-background dark:bg-background-dark rounded-lg shadow overflow-hidden border border-border dark:border-border-dark">
          <div 
            className="overflow-x-auto overflow-y-auto" 
            style={{ 
                maxHeight: 'calc(100vh - 500px)',
                minHeight: '300px'
            }}
          >
            <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead className="bg-card dark:bg-card-dark sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                    Total Solicitudes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                    Duración Promedio (días)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                    Frecuencia (solic/mes)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                    Puntaje Anomalía
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground dark:text-foreground-dark uppercase tracking-wider">
                    Es Anomalía
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background dark:bg-background-dark divide-y divide-border dark:divide-border-dark overflow-y-auto">
                {employeesData.map((item, index) => (
                  <tr key={index} className="hover:bg-card dark:hover:bg-card-dark">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                      <div className="font-medium">{getNameById(item.employee_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                      {!isLoadingData && !dataError && (
                        employees.find(e => e.id === item.employee_id)?.department || 'Sin departamento'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                      {item.total_requests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                      {item.avg_duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                      {item.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-foreground-dark text-center">
                      {item.anomaly_score.toFixed(6)}
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
      ) : (
        <div className="mt-6 bg-background dark:bg-background-dark rounded-lg shadow p-6 border border-border dark:border-border-dark">
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-foreground dark:text-foreground-dark">
              Análisis de empleados
            </h3>
            <p className="mt-1 text-sm text-foreground dark:text-foreground-dark">
              Presiona el botón "Analizar empleados" para evaluar los patrones de solicitud.
            </p>
            {isLoadingData && (
              <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                Cargando información de empleados...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección de gráficos */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de distribución de anomalías */}
        <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
          <div className="flex items-center mb-4 text-foreground dark:text-foreground-dark">
            <FiPieChart className="mr-2 text-primary-text dark:text-primary-text-dark" />
            <h3 className="font-medium">Distribución de Anomalías</h3>
          </div>
          <div className="h-64">
            {chartData ? (
              <Pie 
                data={chartData.anomalyDistribution}
                options={getPieChartOptions()}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded animate-pulse">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
                <span className="text-gray-400 dark:text-gray-300">Esperando datos...</span>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de solicitudes por empleado */}
        <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
          <div className="flex items-center mb-4 text-foreground dark:text-foreground-dark">
            <FiBarChart2 className="mr-2 text-primary-text dark:text-primary-text-dark" />
            <h3 className="font-medium">Solicitudes por Empleado</h3>
          </div>
          <div className="h-64">
            {chartData ? (
              <Bar
                data={chartData.requestsByEmployee}
                options={getBarChartOptions()}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded animate-pulse">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 mb-4"></div>
                <span className="text-gray-400 dark:text-gray-300">Esperando datos...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeAnomalies;