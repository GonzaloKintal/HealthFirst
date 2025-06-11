

import { useState, useEffect } from 'react';
import { 
  FiRefreshCw, 
  FiUser, 
  FiFilter, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiTrendingDown,
  FiInfo,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getHealthRiskPredictions } from '../../services/userService';
import EmployeeSelector from '../supervisor/EmployeeSelector';
import IndividualEmployeeAnalysis from './IndividualEmployeeAnalysis';

ChartJS.register(ArcElement, Tooltip, Legend);

const HealthPredictions = ({ isHealthSectionExpanded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [globalHealthData, setGlobalHealthData] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    limit: 5,
    offset: 0
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [filters, setFilters] = useState({
    risk_level: '',
    user_id: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    risk_level: '',
    user_id: ''
  });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showRiskInfo, setShowRiskInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Mapear los datos de la API al formato esperado
  const mapApiData = (apiData) => {
    if (!Array.isArray(apiData)) {
      console.error('API response is not an array:', apiData);
      return [];
    }

    return apiData.map(employee => {
      let health_status = 'critical';
      const risk = employee?.risk;

      if (typeof risk === 'string' && risk.toLowerCase() === 'low risk') {
        health_status = 'healthy';
      }

      return {
        id: employee.email || 'unknown',
        name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Sin Nombre',
        age: employee.age || 0,
        department: employee.in_high_risk_department ? 'Alto Riesgo' : 'Bajo Riesgo',
        sickLeaves: employee.sickness_license_count || 0,
        accidentLeaves: employee.accident_license_count || 0,
        riskLevel: risk ? (risk.toLowerCase() === 'low risk' ? 'Bajo Riesgo' : 'Alto Riesgo') : 'No evaluado',
        health_status
      };
    });
  };

  const fetchHealthData = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const limit = params.limit || pagination.limit;
      const offset = params.offset !== undefined ? params.offset : pagination.offset;
      const user_id = params.user_id || appliedFilters.user_id || null;
      const risk_level = params.risk_level || appliedFilters.risk_level || null;

      // Fetch global data if not already fetched
      if (!globalHealthData) {
        const globalResponse = await getHealthRiskPredictions({
          limit: 1000,
          offset: 0
        });

        if (!globalResponse) {
          throw new Error('No se recibió respuesta de la API para datos globales');
        }

        const mappedGlobalData = mapApiData(globalResponse.results);
        setGlobalHealthData(mappedGlobalData);
      }

      // Fetch filtered data
      const response = await getHealthRiskPredictions({
        limit,
        offset,
        user_id,
        risk_level: risk_level === 'healthy' ? 'low risk' : risk_level === 'critical' ? 'high risk' : null
      });

      if (!response) {
        throw new Error('No se recibió respuesta de la API');
      }

      const mappedData = mapApiData(response.results);
      setHealthData(mappedData);

      setPagination({
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
        limit,
        offset: Number(offset)
      });
      setHasAnalyzed(true);
    } catch (err) {
      const errorMessage = err.message || 'Error al obtener datos de riesgo de salud';
      setError(errorMessage);
      console.error('Error fetching health data:', err);
      setHealthData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    const newOffset = Math.max(0, Number(pagination.offset) - pagination.limit);
    fetchHealthData({ offset: newOffset });
  };

  const handleNextPage = () => {
    if (pagination.next) {
      const url = new URL(pagination.next);
      const offset = Number(url.searchParams.get('offset') || pagination.offset + pagination.limit);
      fetchHealthData({ offset });
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      await fetchHealthData({ offset: 0 });
    } catch (err) {
      const errorMessage = err.message || 'Error al analizar riesgos de salud';
      setError(errorMessage);
      console.error('Error analyzing health risks:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isHealthSectionExpanded && !hasAnalyzed) {
      fetchHealthData({ offset: 0 });
    }
  }, [isHealthSectionExpanded, hasAnalyzed]);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      risk_level: '',
      user_id: ''
    });
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilters(false);
    if (hasAnalyzed) {
      fetchHealthData({ offset: 0 });
    }
  };

  const filteredData = healthData ? healthData.filter(employee => {
    const matchesRisk = !appliedFilters.risk_level || 
      (appliedFilters.risk_level === 'healthy' && employee.health_status === 'healthy') ||
      (appliedFilters.risk_level === 'critical' && employee.health_status === 'critical');
    
    const matchesEmployee = !appliedFilters.user_id || employee.id === appliedFilters.user_id;
    
    return matchesRisk && matchesEmployee;
  }) : [];

  const getHealthStatusStyle = (status) => {
    const statusMap = {
      healthy: { 
        bg: 'bg-green-100 dark:bg-green-900/50', 
        text: 'text-green-800 dark:text-green-200',
        icon: <FiCheckCircle className="text-green-500" />,
        label: 'Bajo Riesgo'
      },
      critical: { 
        bg: 'bg-red-100 dark:bg-red-900/50', 
        text: 'text-red-800 dark:text-red-200',
        icon: <FiAlertCircle className="text-red-500" />,
        label: 'Alto Riesgo'
      }
    };
  
    return statusMap[status] || { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-800 dark:text-gray-200',
      icon: <FiUser className="text-gray-500" />,
      label: 'No evaluado'
    };
  };

  const getMetrics = () => {
    if (!globalHealthData || !Array.isArray(globalHealthData)) return null;
    
    const criticalCount = globalHealthData.filter(e => e.health_status === 'critical').length;
    const healthyCount = globalHealthData.filter(e => e.health_status === 'healthy').length;
    
    const avgSickLeaves = globalHealthData.length > 0 
      ? globalHealthData.reduce((sum, e) => sum + e.sickLeaves, 0) / globalHealthData.length 
      : 0;
    const avgAccidentLeaves = globalHealthData.length > 0 
      ? globalHealthData.reduce((sum, e) => sum + e.accidentLeaves, 0) / globalHealthData.length 
      : 0;
    
    return {
      criticalCount,
      healthyCount,
      avgSickLeaves: avgSickLeaves.toFixed(1),
      avgAccidentLeaves: avgAccidentLeaves.toFixed(1),
      highestRisk: globalHealthData.length > 0 ? globalHealthData.reduce((prev, current) => 
        (prev.health_status === 'critical') ? prev : current
      ) : null,
      lowestRisk: globalHealthData.length > 0 ? globalHealthData.reduce((prev, current) => 
        (prev.health_status === 'healthy') ? prev : current
      ) : null
    };
  };

  const getChartData = () => {
    if (!globalHealthData) return null;

    const riskCount = globalHealthData.reduce((acc, item) => {
      acc[item.health_status === 'healthy' ? 'Bajo Riesgo' : 'Alto Riesgo'] = 
        (acc[item.health_status === 'healthy' ? 'Bajo Riesgo' : 'Alto Riesgo'] || 0) + 1;
      return acc;
    }, { 'Bajo Riesgo': 0, 'Alto Riesgo': 0 });

    return {
      riskDistribution: {
        labels: ['Bajo Riesgo', 'Alto Riesgo'],
        datasets: [
          {
            data: [riskCount['Bajo Riesgo'], riskCount['Alto Riesgo']],
            backgroundColor: ['#3B82F6', '#FA6464'],
            borderColor: ['#2563EB', '#DC2626'],
            borderWidth: 1,
          },
        ],
      },
    };
  };

  const getDoughnutChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#ffffff' : '#1f2937',
          boxWidth: 20,
          padding: 30,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: globalHealthData && globalHealthData.length > 0,
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

  const metrics = getMetrics();
  const chartData = getChartData();

  return (
    <div className="pt-2">
      <div className="flex justify-between items-start mt-4 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyze}
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
                Actualizar análisis
              </>
            )}
          </button>

          <button 
            onClick={() => setShowRiskInfo(!showRiskInfo)}
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
            {hasAnalyzed && Object.values(appliedFilters).some(val => val !== '') && (
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
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Nivel de riesgo</label>
                  <select
                    name="risk_level"
                    value={filters.risk_level}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-border dark:border-border-dark rounded bg-background dark:bg-background-dark text-foreground"
                  >
                    <option value="">Todos los niveles</option>
                    <option value="healthy">Bajo Riesgo</option>
                    <option value="critical">Alto Riesgo</option>
                  </select>
                </div>

                <div>
                  <EmployeeSelector
                    selectedEmployee={filters.user_id}
                    onEmployeeSelected={(value) => setFilters(prev => ({ ...prev, user_id: value }))}
                    initialEmployees={globalHealthData ? globalHealthData.map(emp => ({ id: emp.id, name: emp.name })) : []}
                    roles={['employee']}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1 text-sm text-foreground hover:text-foreground-dark"
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

      {showRiskInfo && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
            Criterios de Evaluación de Riesgo de Salud
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
            <p>
              Nuestro sistema evalúa el riesgo de salud mediante un modelo avanzado que analiza múltiples factores:
            </p>
            
            <div className="space-y-2">
              <p className="font-semibold text-blue-800 dark:text-blue-100">Factores considerados:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Edad:</strong> Mayor riesgo a partir de los 60 años</li>
                <li><strong>Licencias por enfermedad:</strong> 3 o más en un año indican mayor riesgo</li>
                <li><strong>Licencias por accidentes:</strong> 2 o más en un año incrementan el riesgo</li>
                <li><strong>Departamento:</strong> Áreas con mayor exposición a riesgos laborales</li>
              </ul>
            </div>

            <p className="text-xs italic pt-2 border-t border-blue-200 dark:border-blue-700">
              Nota: El modelo utiliza un algoritmo de regresión logística que pondera cada factor según su impacto en la salud laboral.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {healthData ? (
        <>
          <div className="mt-6 text-xs italic text-foreground">
            Nota: Las estadísticas muestran datos globales y no se ven afectadas por los filtros aplicados.
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 dark:text-red-400 mr-2" />
                <h4 className="font-medium text-foreground">Alto Riesgo</h4>
              </div>
              <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {metrics?.criticalCount || 0}
              </div>
              <div className="text-sm text-foreground">
                {globalHealthData && globalHealthData.length > 0 ? ((metrics?.criticalCount / globalHealthData.length) * 100).toFixed(1) : '0.0'}% del total
              </div>
            </div>

            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center">
                <FiTrendingUp className="text-green-500 mr-2" />
                <h4 className="font-medium text-foreground">Menor Riesgo</h4>
              </div>
              <div className="mt-2 text-xl font-bold text-foreground">
                {metrics?.lowestRisk?.name || 'N/A'}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {metrics?.lowestRisk?.riskLevel || 'N/A'}
              </div>
            </div>

            <div className="bg-background dark:bg-card-dark p-4 rounded-lg shadow border border-border dark:border-border-dark">
              <div className="flex items-center">
                <FiTrendingDown className="text-red-500 mr-2" />
                <h4 className="font-medium text-foreground">Mayor Riesgo</h4>
              </div>
              <div className="mt-2 text-xl font-bold text-foreground">
                {metrics?.highestRisk?.name || 'N/A'}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                {metrics?.highestRisk?.riskLevel || 'N/A'}
              </div>
            </div>
          </div>

          {hoveredRow !== null && filteredData[hoveredRow] && (
            <div 
              className="fixed z-50 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
              style={{
                left: `${tooltipPosition.x + 15}px`,
                top: `${tooltipPosition.y - 30}px`,
              }}
            >
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <div className="font-semibold text-base pb-2 border-b border-gray-200 dark:border-gray-700">
                  {filteredData[hoveredRow].name}
                </div>
                <div>
                  <span className="font-semibold mr-1">Edad:</span>
                  <span className="text-foreground">{filteredData[hoveredRow].age} años</span>
                </div>
                <div>
                  <span className="font-semibold mr-1">Lic. Enfermedad:</span>
                  <span className="text-foreground">{filteredData[hoveredRow].sickLeaves}</span>
                </div>
                <div>
                  <span className="font-semibold mr-1">Lic. Accidentes:</span>
                  <span className="text-foreground">{filteredData[hoveredRow].accidentLeaves}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-background dark:bg-background-dark rounded-lg shadow overflow-hidden border border-border dark:border-border-dark">
            <div 
              className="overflow-x-auto overflow-y-auto" 
              style={{ 
                maxHeight: 'calc(100vh - 400px)',
                minHeight: '300px'
              }}
            >
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead className="bg-card dark:bg-card-dark sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Lic. Enfermedad
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Lic. Accidentes
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                      Nivel de Riesgo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background dark:bg-background-dark divide-y divide-border dark:divide-border-dark">
                  {filteredData.length > 0 ? (
                    filteredData.map((employee, index) => {
                      const status = getHealthStatusStyle(employee.health_status);
                      return (
                        <tr 
                          key={index}
                          className="hover:bg-card dark:hover:bg-card-dark"
                          onMouseEnter={(e) => handleRowMouseEnter(e, index)}
                          onMouseLeave={handleRowMouseLeave}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${status.bg}`}>
                                {status.icon}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-foreground">
                                  {employee.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground">
                            {employee.age}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-center text-foreground">
                            {employee.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground">
                            {employee.sickLeaves}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground">
                            {employee.accidentLeaves}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bg} ${status.text}`}>
                              {employee.riskLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-foreground">
                        No se encontraron empleados que coincidan con los filtros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.previous || isLoading}
                className="px-3 py-2 rounded-l-md border border-border bg-background text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
              >
                <FiChevronLeft className="mr-1" /> Anterior
              </button>
              
              <div className="px-4 py-2 border-t border-b border-border bg-background text-sm font-medium text-foreground">
                Página {Math.floor(pagination.offset / pagination.limit) + 1} de {Math.ceil(pagination.count / pagination.limit)}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={!pagination.next || isLoading}
                className="px-3 py-2 rounded-r-md border border-border bg-background text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
              >
                Siguiente <FiChevronRight className="ml-1" />
              </button>
            </nav>
          </div>

          <div className="mt-8 bg-background dark:bg-card-dark rounded-lg shadow overflow-hidden border border-border dark:border-border-dark">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative" style={{ height: '300px' }}>
                <h4 className="text-base font-medium text-foreground mb-4">Distribución de Riesgos</h4>
                {chartData && globalHealthData.length > 0 ? (
                  <Doughnut 
                    data={chartData.riskDistribution}
                    options={getDoughnutChartOptions()}
                    className='mb-10 md:mb-0'
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-300">Sin datos para mostrar</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg h-full border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-medium text-foreground mb-6">Estadísticas Globales</h4>
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Empleados</div>
                    <div className="text-2xl font-bold text-foreground">
                      {globalHealthData ? globalHealthData.length : '0'}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bajo Riesgo</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {metrics?.healthyCount || '0'}
                        </div>
                      </div>
                      {globalHealthData && globalHealthData.length > 0 && (
                        <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          {((metrics?.healthyCount / globalHealthData.length) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Alto Riesgo</div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {metrics?.criticalCount || '0'}
                        </div>
                      </div>
                      {globalHealthData && globalHealthData.length > 0 && (
                        <span className="text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                          {((metrics?.criticalCount / globalHealthData.length) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <IndividualEmployeeAnalysis
            employees={globalHealthData || []}
            isDarkMode={isDarkMode}
          />
        </>
      ) : (
        <div className="mt-6 bg-background dark:bg-background-dark rounded-lg shadow p-6 border border-border dark:border-border-dark">
          <div className="text-center py-8">
            <FiUser className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-3 text-lg font-medium text-foreground">
              Evaluación de Riesgo de Salud
            </h3>
            <p className="mt-2 text-sm text-foreground">
              {isLoading ? 'Cargando datos de empleados...' : 'Presiona el botón "Actualizar análisis" para evaluar los riesgos de salud'}
            </p>
          </div>

          
        </div>
      )}

      <IndividualEmployeeAnalysis
        employees={globalHealthData || []}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default HealthPredictions;