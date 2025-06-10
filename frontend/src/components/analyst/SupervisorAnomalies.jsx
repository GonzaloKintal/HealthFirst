

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiPieChart, FiUser, FiFilter, FiX, FiAlertTriangle, FiTrendingUp, FiTrendingDown, FiInfo } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, ScatterController } from 'chart.js';
import { Pie, Scatter } from 'react-chartjs-2';
import { getSupervisorAnomalies } from '../../services/licenseService';
import { getUser } from '../../services/userService';
import StyledDatePicker from '../utils/StyledDatePicker';
import EmployeeSelector from '../supervisor/EmployeeSelector';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, ScatterController);

const SupervisorAnomalies = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [supervisors, setSupervisors] = useState({});
  const [anomaliesData, setAnomaliesData] = useState(null);
  const [globalAnomaliesData, setGlobalAnomaliesData] = useState(null);
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
  const [hoveredRow, setHoveredRow] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showInfoModal, setShowInfoModal] = useState(false);

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
      setIsLoading(true);

      const globalResult = await getSupervisorAnomalies({});
      
      if (!globalResult.success) {
        throw new Error(globalResult.error || 'Error al analizar anomalías');
      }

      const transformedGlobalData = transformApiData(globalResult.data);
      setGlobalAnomaliesData(transformedGlobalData);

      const filteredResult = await getSupervisorAnomalies({
        start_date: filters.start_date ? filters.start_date.toISOString().split('T')[0] : null,
        end_date: filters.end_date ? filters.end_date.toISOString().split('T')[0] : null,
        user_id: filters.user_id || null,
        is_anomaly: filters.is_anomaly || null
      });

      if (!filteredResult.success) {
        throw new Error(filteredResult.error || 'Error al analizar anomalías');
      }

      const transformedFilteredData = transformApiData(filteredResult.data);
      setAnomaliesData(transformedFilteredData);

      const allSupervisorIds = [
        ...new Set([
          ...transformedGlobalData.map(item => item.evaluator_id),
          ...transformedFilteredData.map(item => item.evaluator_id)
        ])
      ];

      const supervisorPromises = allSupervisorIds.map(async (id) => {
        if (!supervisors[id]) {
          try {
            const supervisorData = await getUser(id);
            return { id, ...supervisorData };
          } catch (err) {
            console.error(`Error fetching supervisor ${id}:`, err);
            return { id, name: `Supervisor (ID: ${id})`, department: 'Sin departamento' };
          }
        }
        return null;
      });

      const fetchedSupervisors = (await Promise.all(supervisorPromises)).filter(sup => sup !== null);
      setSupervisors(prev => ({
        ...prev,
        ...fetchedSupervisors.reduce((acc, sup) => ({ ...acc, [sup.id]: sup }), {})
      }));

      setHasAnalyzed(true);
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing anomalies:', err);
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };

  const handleRowMouseEnter = (event, index) => {
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
    setHoveredRow(index);
  };

  const handleRowMouseLeave = () => {
    setHoveredRow(null);
  };

  const transformApiData = (apiData) => {
    return apiData.map(item => ({
      evaluator_id: item.evaluator_id,
      total_requests: item.total_requests,
      approved_requests: item.approved_requests,
      rejected_requests: item.rejected_requests,
      approval_rate: parseFloat(item.approval_rate) || 0,
      rejection_rate: parseFloat(item.rejection_rate) || 0,
      is_anomaly: item.is_anomaly,
      approval_rate_diff: item.approval_rate_diff || '0%',
      rejection_rate_diff: item.rejection_rate_diff || '0%',
      total_requests_percent: item.total_requests_percent || '0%'
    }));
  };

  const getNameById = (id) => {
    if (isLoading) return 'Cargando...';
    if (error) return `Supervisor (ID: ${id})`;

    const supervisor = supervisors[id];
    if (!supervisor) {
      return `Supervisor (ID: ${id})`;
    }
    return supervisor.name || supervisor.full_name || `Supervisor (ID: ${id})`;
  };

  const getDepartmentById = (id) => {
    if (isLoading) return 'Cargando datos de supervisores...';
    if (error) return 'Sin departamento';

    const supervisor = supervisors[id];
    return supervisor?.department || 'Sin departamento';
  };

  const getChartData = () => {
    if (!anomaliesData) return null;

    const anomalyCount = anomaliesData.reduce((acc, item) => {
      acc[item.is_anomaly ? 'Anomalías' : 'Normales'] = (acc[item.is_anomaly ? 'Anomalías' : 'Normales'] || 0) + 1;
      return acc;
    }, { 'Anomalías': 0, 'Normales': 0 });

    return {
      anomalyDistribution: {
        labels: ['Normales', 'Anomalías'],
        datasets: [
          {
            data: [anomalyCount.Normales, anomalyCount.Anomalías],
            backgroundColor: ['#3B82F6', '#FA6464'],
            borderColor: ['#2563EB', '#DC2626'],
            borderWidth: 1,
          },
        ],
      },
      scatterData: {
        datasets: anomaliesData.length > 0 ? anomaliesData.map(item => ({
          label: getNameById(item.evaluator_id),
          data: [{
            x: item.total_requests,
            y: item.approval_rate,
            r: 10
          }],
          backgroundColor: item.is_anomaly 
            ? 'rgba(239, 68, 68, 0.7)' 
            : 'rgba(59, 130, 246, 0.7)',
          borderColor: item.is_anomaly ? '#DC2626' : '#2563EB',
          borderWidth: 1
        })) : []
      }
    };
  };

  const getPieChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#ffffff' : '#1f2937',
        },
      },
      tooltip: {
        enabled: anomaliesData && anomaliesData.length > 0,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw || 0;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  });

  const getScatterOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: { 
          display: true, 
          text: 'Tasa de Aprobación (%)',
          color: isDarkMode ? '#ffffff' : '#1f2937'
        },
        min: 0,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#ffffff' : '#1f2937',
        }
      },
      x: {
        title: { 
          display: true, 
          text: 'Total de Solicitudes',
          color: isDarkMode ? '#ffffff' : '#1f2937'
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          color: isDarkMode ? '#ffffff' : '#1f2937',
        }
      }
    },
    plugins: {
      tooltip: {
        enabled: anomaliesData && anomaliesData.length > 0,
        callbacks: {
          label: (ctx) => {
            const item = anomaliesData[ctx.datasetIndex];
            return [
              `Supervisor: ${getNameById(item.evaluator_id)}`,
              `Solicitudes: ${ctx.parsed.x}`,
              `Aprobación: ${ctx.parsed.y}%`,
              `Desviación: ${item.approval_rate_diff}`
            ];
          }
        }
      },
      legend: {
        display: false
      }
    }
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

  const chartData = anomaliesData !== null ? getChartData() : null;

  return (
    <div className="pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start mt-4 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeAnomalies}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-md flex items-center ${
              isAnalyzing
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

          <button 
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors duration-200"
          >
            <FiInfo className="text-gray-700 dark:text-gray-200 text-lg" />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={!hasAnalyzed}
            className={`px-4 py-2 rounded-md flex items-center border ${
              hasAnalyzed
                ? 'bg-card dark:bg-card-dark text-foreground hover:bg-card-hover dark:hover:bg-card-hover-dark border-border dark:border-border-dark cursor-pointer'
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
                <h3 className="font-medium text-foreground">Filtrar resultados</h3>
                <button onClick={() => setShowFilters(false)} className="text-foreground">
                  <FiX />
                </button>
              </div>

              <div className="space-y-3">
                <EmployeeSelector
                  selectedEmployee={filters.user_id}
                  onEmployeeSelected={(value) => setFilters(prev => ({ ...prev, user_id: value }))}
                  initialEmployees={Object.values(supervisors)}
                  roles={['supervisor']}
                />

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Estado</label>
                  <select
                    name="is_anomaly"
                    value={filters.is_anomaly}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-border dark:border-border-dark rounded bg-background dark:bg-background-dark text-foreground"
                  >
                    <option value="">Todos</option>
                    <option value="true">Solo anomalías</option>
                    <option value="false">Solo normales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Fecha desde</label>
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
                  <label className="block text-sm font-medium mb-1 text-foreground">Fecha hasta</label>
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
                    className="px-3 py-1 text-sm text-foreground dark:hover:text-gray-800"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showInfoModal && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
            Criterios de Evaluación de Anomalías para Supervisores
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
              <div className="text-sm">
                <p>Nuestro sistema evalúa las anomalías mediante un modelo avanzado que analiza múltiples factores:</p>

                <div className="space-y-2">
                  <p className="font-semibold text-blue-800 dark:text-blue-100">Factores considerados:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>?:</strong> Comming soon</li>
                    <li><strong>?:</strong> Comming soon</li>
                    <li><strong>?:</strong> Comming soon</li>
                    <li><strong>?:</strong> Comming soon</li>
                  </ul>
                </div>

                <p className="text-xs italic pt-2 border-t border-blue-200 dark:border-blue-700">
                  Nota: El modelo utiliza un algoritmo de ¿?
                </p>
              </div>
            </div>
          </h3>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {hasAnalyzed && anomaliesData !== null ? (
        <>
          {/* Panel de métricas clave - USANDO DATOS GLOBALES */}
          <div className="mt-6 text-xs italic text-foreground">
            Nota: Las estadísticas muestran datos globales y no se ven afectadas por los filtros aplicados.
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center">
                <FiAlertTriangle className="text-red-500 dark:text-red-400 mr-2" />
                <h4 className="font-medium text-foreground">Anomalías Detectadas</h4>
              </div>
              <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {globalAnomaliesData ? globalAnomaliesData.filter(d => d.is_anomaly).length : '--'}
              </div>
              <div className="text-sm text-foreground">
                {globalAnomaliesData && globalAnomaliesData.length > 0
                  ? `${((globalAnomaliesData.filter(d => d.is_anomaly).length / globalAnomaliesData.length) * 100).toFixed(1)}% del total`
                  : '0% del total'}
              </div>
            </div>

            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center">
                <FiTrendingUp className="text-green-500 mr-2" />
                <h4 className="font-medium text-foreground">Mayor Aprobación</h4>
              </div>
              {globalAnomaliesData && globalAnomaliesData.length > 0 ? (
                <>
                  <div className="mt-2 text-xl font-bold text-foreground">
                    {getNameById(globalAnomaliesData.reduce((prev, current) => 
                      (prev.approval_rate > current.approval_rate) ? prev : current
                    ).evaluator_id)}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    {globalAnomaliesData.reduce((prev, current) => 
                      (prev.approval_rate > current.approval_rate) ? prev : current
                    ).approval_rate.toFixed(1)}%
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-2 text-xl font-bold text-foreground">N/A</div>
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center">0%</div>
                </>
              )}
            </div>

            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center">
                <FiTrendingDown className="text-red-500 mr-2" />
                <h4 className="font-medium text-foreground">Menor Aprobación</h4>
              </div>
              {globalAnomaliesData && globalAnomaliesData.length > 0 ? (
                <>
                  <div className="mt-2 text-xl font-bold text-foreground">
                    {getNameById(globalAnomaliesData.reduce((prev, current) => 
                      (prev.approval_rate < current.approval_rate) ? prev : current
                    ).evaluator_id)}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    {globalAnomaliesData.reduce((prev, current) => 
                      (prev.approval_rate < current.approval_rate) ? prev : current
                    ).approval_rate.toFixed(1)}%
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-2 text-xl font-bold text-foreground">N/A</div>
                  <div className="text-sm text-red-600 dark:text-red-400 flex items-center">0%</div>
                </>
              )}
            </div>
          </div>

          {hoveredRow !== null && anomaliesData && anomaliesData[hoveredRow] && (
            <div 
              className="fixed z-50 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
              style={{
                left: `${tooltipPosition.x + 15}px`,
                top: `${tooltipPosition.y - 30}px`,
              }}
            >
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <div className="font-semibold text-base pb-2 border-b border-gray-200 dark:border-gray-700">
                  {getNameById(anomaliesData[hoveredRow].evaluator_id)}
                </div>

                <div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-1">Aprobación:</span>
                    <span className={`font-medium ${
                      anomaliesData[hoveredRow].approval_rate_diff.startsWith('+') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {anomaliesData[hoveredRow].approval_rate_diff}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    {anomaliesData[hoveredRow].approval_rate_diff.startsWith('+') 
                      ? `Aprueba un ${anomaliesData[hoveredRow].approval_rate_diff.replace('+', '')} más que el promedio`
                      : `Aprueba un ${anomaliesData[hoveredRow].approval_rate_diff.replace('-', '')} menos que el promedio`}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-1">Rechazo:</span>
                    <span className={`font-medium ${
                      anomaliesData[hoveredRow].rejection_rate_diff.startsWith('+') 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {anomaliesData[hoveredRow].rejection_rate_diff}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    {anomaliesData[hoveredRow].rejection_rate_diff.startsWith('+') 
                      ? `Rechaza un ${anomaliesData[hoveredRow].rejection_rate_diff.replace('+', '')} más que el promedio`
                      : `Rechaza un ${anomaliesData[hoveredRow].rejection_rate_diff.replace('-', '')} menos que el promedio`}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-1">Participación:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {anomaliesData[hoveredRow].total_requests_percent}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    Gestionó el {anomaliesData[hoveredRow].total_requests_percent} de todas las solicitudes analizadas.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-background dark:bg-background-dark rounded-lg shadow overflow-hidden border border-border dark:border-border-dark">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead className="bg-card dark:bg-card-dark sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Evaluaciones
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Aprobadas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Rechazadas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Tasa Aprobación
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Es Anomalía
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background dark:bg-background-dark divide-y divide-border dark:divide-border-dark">
                  {anomaliesData.length > 0 ? (
                    anomaliesData.map((item, index) => (
                      <tr 
                        key={item.evaluator_id}
                        className="hover:bg-card dark:hover:bg-card-dark"
                        onMouseEnter={(e) => handleRowMouseEnter(e, index)}
                        onMouseLeave={handleRowMouseLeave}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center">
                          <div className="font-medium">{getNameById(item.evaluator_id)}</div>
                          {!isLoading && !error && Object.keys(supervisors).length > 0 && (
                            <div className="text-xs text-foreground">
                              {getDepartmentById(item.evaluator_id)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center">
                          {item.total_requests}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center">
                          {item.approved_requests}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center">
                          {item.rejected_requests}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-center">
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-foreground">
                        No se encontraron resultados para los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center mb-4 text-foreground">
                <FiPieChart className="mr-2 text-primary-text dark:text-primary-text-dark" />
                <h3 className="font-medium">Distribución de Anomalías</h3>
              </div>
              <div className="h-64">
                {chartData && anomaliesData.length > 0 ? (
                  <Pie 
                    data={chartData.anomalyDistribution}
                    options={getPieChartOptions()}
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-300">Sin datos para mostrar</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center mb-4 text-foreground">
                <FiAlertTriangle className="mr-2 text-primary-text dark:text-primary-text-dark" />
                <h3 className="font-medium">Análisis de Patrones</h3>
              </div>
              <div className="h-64">
                {chartData && anomaliesData.length > 0 ? (
                  <Scatter
                    data={chartData.scatterData}
                    options={getScatterOptions()}
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-300">Sin datos para mostrar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 bg-background dark:bg-background-dark rounded-lg shadow p-6 border border-border dark:border-border-dark">
          <div className="text-center py-12">
            <FiUser className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-foreground">
              Análisis de supervisores
            </h3>
            <p className="mt-1 text-sm text-foreground">
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