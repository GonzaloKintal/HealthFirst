

import { useState, useEffect } from 'react';
import {
  FiRefreshCw,
  FiUsers,
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
import IndividualEmployeeAnalysis from './IndividualEmployeeAnalysis';
import Select from 'react-select';
import { customStyles } from '../../components/utils/utils';

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
    offset: 0,
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [filters, setFilters] = useState({
    risk_level: '',
    user_id: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    risk_level: '',
    user_id: '',
  });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showRiskInfo, setShowRiskInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Map API data
  const mapApiData = (apiData) => {
    if (!Array.isArray(apiData)) {
      console.error('API response is not an array:', apiData);
      return [];
    }

    return apiData.map((employee) => ({
      id: employee.email || 'unknown',
      name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Sin Nombre',
      age: employee.age || 0,
      department: employee.in_high_risk_department ? 'Alto Riesgo' : 'Bajo Riesgo',
      sickLeaves: employee.sickness_license_count || 0,
      accidentLeaves: employee.accident_license_count || 0,
      riskLevel: employee.risk
        ? employee.risk.toLowerCase() === 'low risk'
          ? 'Bajo Riesgo'
          : 'Alto Riesgo'
        : 'No evaluado',
      health_status: employee.risk?.toLowerCase() === 'low risk' ? 'healthy' : 'critical',
    }));
  };

  const fetchHealthData = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const limit = params.limit || pagination.limit;
      // const offset = params.offset !== undefined ? params.offset : pagination.offset;
      const offset = params.forceOffset !== undefined ? params.forceOffset : 
                 (params.offset !== undefined ? params.offset : pagination.offset);
      const user_id = params.user_id || appliedFilters.user_id || null;
      const risk_level = params.risk_level || appliedFilters.risk_level || null;

      // Fetch global data
      if (!globalHealthData) {
        const globalResponse = await getHealthRiskPredictions({
          limit: 1000,
          offset: 0,
          risk_level: null
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
        risk_level: risk_level === 'healthy' ? 'low' : 
                risk_level === 'critical' ? 'high' : 
                null
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
        offset: Number(offset),
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
  fetchHealthData({ 
    offset: newOffset,
    risk_level: appliedFilters.risk_level // Mantenemos el filtro al cambiar de página
  });
};

const handleNextPage = () => {
  if (pagination.next) {
    const url = new URL(pagination.next);
    const offset = Number(url.searchParams.get('offset') || pagination.offset + pagination.limit);
    fetchHealthData({ 
      offset,
      risk_level: appliedFilters.risk_level // Mantenemos el filtro al cambiar de página
    });
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
    const tooltipWidth = 256;
    const windowWidth = window.innerWidth;
    const offsetX = 15;

    let xPos = event.clientX + offsetX;
    if (xPos + tooltipWidth > windowWidth - 10) {
      xPos = event.clientX - tooltipWidth - offsetX;
    }

    setTooltipPosition({
      x: xPos,
      y: event.clientY - 30,
    });
    setHoveredRow(index);
  };

  const handleRowMouseLeave = () => {
    setHoveredRow(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      risk_level: '',
      user_id: '',
    });
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilters(false);
    if (hasAnalyzed) {
      fetchHealthData({ 
        offset: 0,
        forceOffset: 0,
        risk_level: filters.risk_level 
      });
    }
  };

  const filteredData = healthData
    ? healthData.filter((employee) => {
        const matchesRisk =
          !appliedFilters.risk_level ||
          (appliedFilters.risk_level === 'healthy' && employee.health_status === 'healthy') ||
          (appliedFilters.risk_level === 'critical' && employee.health_status === 'critical');

        const matchesEmployee = !appliedFilters.user_id || employee.id === appliedFilters.user_id;

        return matchesRisk && matchesEmployee;
      })
    : [];

  const getHealthStatusStyle = (status) => {
    const statusMap = {
      healthy: {
        bg: 'bg-green-100 dark:bg-green-900/50',
        text: 'text-green-800 dark:text-green-200',
        icon: <FiCheckCircle className="text-green-500" />,
        label: 'Bajo Riesgo',
      },
      critical: {
        bg: 'bg-red-100 dark:bg-red-900/50',
        text: 'text-red-800 dark:text-red-200',
        icon: <FiAlertCircle className="text-red-500" />,
        label: 'Alto Riesgo',
      },
    };

    return (
      statusMap[status] || {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        icon: <FiUsers className="text-gray-500" />,
        label: 'No evaluado',
      }
    );
  };

  const getMetrics = () => {
    if (!globalHealthData || !Array.isArray(globalHealthData)) return null;

    const criticalCount = globalHealthData.filter((e) => e.health_status === 'critical').length;
    const healthyCount = globalHealthData.filter((e) => e.health_status === 'healthy').length;

    const avgSickLeaves =
      globalHealthData.length > 0
        ? globalHealthData.reduce((sum, e) => sum + e.sickLeaves, 0) / globalHealthData.length
        : 0;
    const avgAccidentLeaves =
      globalHealthData.length > 0
        ? globalHealthData.reduce((sum, e) => sum + e.accidentLeaves, 0) / globalHealthData.length
        : 0;

    return {
      criticalCount,
      healthyCount,
      avgSickLeaves: avgSickLeaves.toFixed(1),
      avgAccidentLeaves: avgAccidentLeaves.toFixed(1),
      highestRisk:
        globalHealthData.length > 0
          ? globalHealthData.reduce((prev, current) =>
              prev.health_status === 'critical' ? prev : current
            )
          : null,
      lowestRisk:
        globalHealthData.length > 0
          ? globalHealthData.reduce((prev, current) =>
              prev.health_status === 'healthy' ? prev : current
            )
          : null,
    };
  };

  const getChartData = () => {
    if (!globalHealthData) return null;

    const riskCount = globalHealthData.reduce(
      (acc, item) => {
        acc[item.health_status === 'healthy' ? 'Bajo Riesgo' : 'Alto Riesgo'] =
          (acc[item.health_status === 'healthy' ? 'Bajo Riesgo' : 'Alto Riesgo'] || 0) + 1;
        return acc;
      },
      { 'Bajo Riesgo': 0, 'Alto Riesgo': 0 }
    );

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
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: globalHealthData && globalHealthData.length > 0,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw || 0;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  });

  const metrics = getMetrics();
  const chartData = getChartData();

  const riskLevelOptions = [
    { value: '', label: 'Todos' },
    { value: 'healthy', label: 'Bajo riesgo' },
    { value: 'critical', label: 'Alto riesgo' }
  ];

  return (
    <div className="overflow-y-auto pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-md flex items-center ${
              isAnalyzing
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analizando...
              </>
            ) : (
              <>
                <FiRefreshCw className="mr-2 hidden sm:inline" />
                Actualizar análisis
              </>
            )}
          </button>
          <button
            onClick={() => setShowRiskInfo(!showRiskInfo)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
            aria-label="Información de riesgo"
          >
            <FiInfo className="text-gray-700 dark:text-gray-200 text-xl" />
          </button>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={!hasAnalyzed}
            className={`px-4 py-2 rounded-md flex items-center justify-center border ${
              hasAnalyzed
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
            } w-full sm:w-auto`}
          >
            <FiFilter className="mr-2" />
            Filtros
            {hasAnalyzed && Object.values(appliedFilters).some((val) => val !== '') && (
              <span className="ml-2 w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>
          {showFilters && hasAnalyzed && (
            <div className={`absolute mt-2 w-60 sm:w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 p-4 ${
              window.innerWidth < 640 ? 'left-0' : 'right-0'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-300">Filtrar resultados</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
                  aria-label="Cerrar filtros"
                >
                  <FiX />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-300">
                    Nivel de riesgo
                  </label>
                  <Select
                    options={riskLevelOptions}
                    value={riskLevelOptions.find(option => option.value === filters.risk_level)}
                    onChange={(selectedOption) => handleFilterChange({ target: { name: 'risk_level', value: selectedOption.value } })}
                    styles={customStyles}
                    isSearchable={false}
                    className="w-full text-sm"
                    classNamePrefix="select"
                    menuPlacement="auto"
                    menuPosition="fixed"
                  />
                </div>
                <div className="flex justify-between pt-2">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1 text-sm text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    Limpiar filtros
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
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
              Nuestro sistema evalúa el riesgo de salud mediante un modelo avanzado que analiza
              múltiples factores:
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-blue-800 dark:text-blue-100">Factores considerados:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Edad:</strong> Mayor riesgo a partir de los 60 años
                </li>
                <li>
                  <strong>Licencias por enfermedad:</strong> 3 o más en un año indican mayor riesgo
                </li>
                <li>
                  <strong>Licencias por accidentes:</strong> 2 o más en un año incrementan el riesgo
                </li>
                <li>
                  <strong>Departamento:</strong> Áreas con mayor exposición a riesgos laborales
                </li>
              </ul>
            </div>
            <p className="text-xs italic pt-2 border-t border-blue-200 dark:border-blue-700">
              Nota: El modelo utiliza un algoritmo de regresión logística que pondera cada factor según
              su impacto en la salud laboral.
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
          <div className="mt-4 text-xs italic text-gray-600 dark:text-gray-400">
            Nota: Las estadísticas muestran datos globales y no se afectan por los filtros aplicados.
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-600 dark:text-red-400 mr-2" />
                <h4 className="font-medium text-gray-900 dark:text-gray-300">Alto Riesgo</h4>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                {metrics?.criticalCount ?? 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {globalHealthData?.length > 0
                  ? ((metrics?.criticalCount / globalHealthData.length) * 100).toFixed(1)
                  : '0.0'}
                % del total
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <FiTrendingUp className="text-green-600 dark:text-green-400 mr-2" />
                <h4 className="font-medium text-gray-900 dark:text-gray-300">Menor Riesgo</h4>
              </div>
              <div className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-300">
                {metrics?.lowestRisk?.name ?? 'N/A'}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {metrics?.lowestRisk?.riskLevel ?? 'N/A'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <FiTrendingDown className="text-red-600 dark:text-red-400 mr-2" />
                <h4 className="font-medium text-gray-900 dark:text-gray-300">Mayor Riesgo</h4>
              </div>
              <div className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-300">
                {metrics?.highestRisk?.name ?? 'N/A'}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                {metrics?.highestRisk?.riskLevel ?? 'N/A'}
              </div>
            </div>
          </div>

          {hoveredRow !== null && healthData[hoveredRow] && (
            <div
              className="fixed z-50 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg pointer-events-none"
              style={{
                left: `${tooltipPosition.x + 15}px`,
                top: `${tooltipPosition.y - 30}px`,
              }}
            >
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <div className="font-semibold text-base">
                  {healthData[hoveredRow].name}
                </div>
                <div className="flex items-center pb-2 border-b border-gray-200 dark:border-gray-600">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getHealthStatusStyle(healthData[hoveredRow].health_status).bg
                    } ${
                      getHealthStatusStyle(healthData[hoveredRow].health_status).text
                    }`}
                  >
                    {healthData[hoveredRow].riskLevel}
                  </span>
                </div>
                <div>
                  <span className="font-semibold mr-1">Edad:</span>
                  <span className="text-gray-900 dark:text-gray-300">
                    {healthData[hoveredRow].age} años
                  </span>
                </div>
                <div>
                  <span className="font-semibold mr-1">Lic. Enfermedad:</span>
                  <span className="text-gray-900 dark:text-gray-300">
                    {healthData[hoveredRow].sickLeaves}
                  </span>
                </div>
                <div>
                  <span className="font-semibold mr-1">Lic. Accidentes:</span>
                  <span className="text-gray-900 dark:text-gray-300">
                    {healthData[hoveredRow].accidentLeaves}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-600">
            <div className="overflow-x-auto overflow-y-auto max-h-[50vh] min-h-[200px]">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lic. Enfermedad
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lic. Accidentes
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nivel de Riesgo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredData.length > 0 ? (
                    filteredData.map((employee, index) => {
                      const status = getHealthStatusStyle(employee.health_status);
                      return (
                        <tr
                          key={employee.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          onMouseEnter={(e) => handleRowMouseEnter(e, index)}
                          onMouseLeave={handleRowMouseLeave}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${status.bg}`}
                              >
                                {status.icon}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                  {employee.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">
                            {employee.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">
                            {employee.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">
                            {employee.sickLeaves}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">
                            {employee.accidentLeaves}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bg} ${status.text}`}
                            >
                              {employee.riskLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-300"
                      >
                        No se encontraron empleados que coincidan con los filtros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-4 mb-4">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.previous || isLoading}
                  className="px-3 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 flex items-center dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <FiChevronLeft className="mr-1" /> Anterior
                </button>
                <div className="px-4 py-2 border-t border-b border-gray-200 bg-white text-sm font-medium text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                  Página {Math.floor(pagination.offset / pagination.limit) + 1} de{' '}
                  {Math.ceil(pagination.count / pagination.limit)}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.next || isLoading}
                  className="px-3 py-2 rounded-r-md border border-gray-200 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50 flex items-center dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Siguiente <FiChevronRight className="ml-1" />
                </button>
              </nav>
            </div>
          </div>
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative h-64">
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Distribución de Riesgos
                </h4>
                {chartData && globalHealthData?.length > 0 ? (
                  <Doughnut data={chartData.riskDistribution} options={getDoughnutChartOptions()} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Sin datos para mostrar</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-8 sm:mt-0">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-300 mb-4">
                  Estadísticas Globales
                </h4>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Total Empleados
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-300">
                      {globalHealthData?.length ?? 0}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Bajo Riesgo
                        </div>
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          {metrics?.healthyCount ?? 0}
                        </div>
                      </div>
                      {globalHealthData?.length > 0 && (
                        <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          {((metrics?.healthyCount / globalHealthData.length) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Alto Riesgo
                        </div>
                        <div className="text-xl font-bold text-red-600 dark:text-red-400">
                          {metrics?.criticalCount ?? 0}
                        </div>
                      </div>
                      {globalHealthData?.length > 0 && (
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
        </>
      ) : (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-600">
          <div className="text-center py-8">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-300">
              Evaluación de Riesgo de Salud
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isLoading
                ? 'Cargando datos de empleados...'
                : 'Presiona "Actualizar análisis" para evaluar los riesgos de salud'}
            </p>
          </div>
        </div>
      )}

       <div className="mt-4">
        <IndividualEmployeeAnalysis employees={globalHealthData || []} isDarkMode={isDarkMode} />
      </div> 
    </div>
  );
};

export default HealthPredictions;