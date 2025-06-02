import { useState } from 'react';
import { FiUser, FiActivity, FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw, FiSearch, FiFilter, FiInfo } from 'react-icons/fi';
import Confirmation from '../../components/utils/Confirmation';
import Notification from '../../components/utils/Notification';

const HealthPredictions = () => {
  // Mock data for employees with health risk factors
  const mockEmployees = [
    {
      id: 1,
      name: 'Juan Pérez',
      dni: '30123456',
      department: 'Ventas',
      position: 'Representante',
      age: 28,
      sickLeavesLastYear: 1,
      accidentLeavesLastYear: 0,
      lastEvaluation: '2023-05-15'
    },
    {
      id: 2,
      name: 'María Gómez',
      dni: '28987654',
      department: 'Producción',
      position: 'Operario',
      age: 35,
      sickLeavesLastYear: 3,
      accidentLeavesLastYear: 1,
      lastEvaluation: '2023-04-28'
    },
    {
      id: 3,
      name: 'Carlos López',
      dni: '33456789',
      department: 'Logística',
      position: 'Conductor',
      age: 52,
      sickLeavesLastYear: 5,
      accidentLeavesLastYear: 2,
      lastEvaluation: '2023-03-10'
    },
    {
      id: 4,
      name: 'Ana Martínez',
      dni: '35678901',
      department: 'RRHH',
      position: 'Reclutadora',
      age: 29,
      sickLeavesLastYear: 0,
      accidentLeavesLastYear: 0,
      lastEvaluation: '2023-05-20'
    },
    {
      id: 5,
      name: 'Pedro Rodríguez',
      dni: '27654321',
      department: 'Mantenimiento',
      position: 'Técnico',
      age: 41,
      sickLeavesLastYear: 4,
      accidentLeavesLastYear: 3,
      lastEvaluation: null
    }
  ];

  // Risk calculation function
  const calculateHealthRisk = (employee) => {
    // Department risk factors (higher risk departments)
    const highRiskDepartments = ['Producción', 'Logística', 'Mantenimiento'];
    
    // Base risk from age
    let ageRisk = 0;
    if (employee.age < 30) ageRisk = 1;
    else if (employee.age >= 30 && employee.age <= 50) ageRisk = 2;
    else ageRisk = 3; // >50
    
    // Risk from sick leaves
    let sickLeaveRisk = 0;
    if (employee.sickLeavesLastYear <= 1) sickLeaveRisk = 1;
    else if (employee.sickLeavesLastYear <= 3) sickLeaveRisk = 2;
    else sickLeaveRisk = 3; // >3
    
    // Risk from accident leaves
    let accidentRisk = employee.accidentLeavesLastYear > 0 ? 2 : 0;
    
    // Department risk
    const departmentRisk = highRiskDepartments.includes(employee.department) ? 2 : 1;
    
    // Total risk score (weighted calculation)
    const totalRisk = 
      (ageRisk * 0.3) + 
      (sickLeaveRisk * 0.4) + 
      (accidentRisk * 0.2) + 
      (departmentRisk * 0.1);
    
    // Determine risk level
    if (totalRisk < 1.5) return { level: 'Bajo', score: totalRisk };
    if (totalRisk < 2.5) return { level: 'Medio', score: totalRisk };
    return { level: 'Alto', score: totalRisk };
  };

  // Add calculated risk to employees
  const employeesWithRisk = mockEmployees.map(emp => {
    const risk = calculateHealthRisk(emp);
    return {
      ...emp,
      riskLevel: risk.level,
      riskScore: risk.score,
      health_status: risk.level === 'Bajo' ? 'healthy' : 
                    risk.level === 'Medio' ? 'warning' : 'critical'
    };
  });

  const [employees, setEmployees] = useState(employeesWithRisk);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAnalysisConfirmation, setShowAnalysisConfirmation] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [showRiskInfo, setShowRiskInfo] = useState(false);

  // Filter employees based on search and filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.dni.includes(searchTerm) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || employee.health_status === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Handle search
  const handleSearch = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  
  // Handle key down
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle health analysis
  const handleAnalyze = () => {
    setShowAnalysisConfirmation(true);
  };
  
  const confirmAnalysis = () => {
    setLoading(true);
    // Simulate analysis process
    setTimeout(() => {
      setLoading(false);
      showNotification('success', 'Análisis de riesgo de salud completado correctamente');
      setShowAnalysisConfirmation(false);
      
      // Update evaluations with current date
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        lastEvaluation: new Date().toISOString().split('T')[0]
      })));
    }, 2000);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Health status colors and icons
  const getHealthStatusColors = (status) => {
    const statusMap = {
      healthy: { 
        bg: 'bg-green-100', 
        text: 'text-green-700',
        icon: <FiCheckCircle className="text-green-500" />,
        label: 'Bajo riesgo'
      },
      warning: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-600',
        icon: <FiAlertCircle className="text-yellow-500" />,
        label: 'Riesgo medio'
      },
      critical: { 
        bg: 'bg-red-100', 
        text: 'text-red-700',
        icon: <FiAlertCircle className="text-red-500" />,
        label: 'Alto riesgo'
      }
    };
  
    return statusMap[status] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-700',
      icon: <FiUser className="text-gray-500" />,
      label: 'No evaluado'
    };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3 md:gap-0">
        <h2 className="text-xl sm:text-2xl text-foreground font-bold flex items-center">
          <FiActivity className="mr-2" />
          Evaluación de Riesgo de Salud
        </h2>

        <div className="flex flex-col xs:flex-row md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          <span className="text-sm text-foreground order-2 md:order-none">
            Mostrando {filteredEmployees.length} empleados
          </span>

          <button
            onClick={handleAnalyze}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-primary-hover transition duration-200 order-1 md:order-none"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Evaluando...' : 'Evaluar Riesgo'}
          </button>
        </div>
      </div>

      {/* Risk calculation info - with dark mode support */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg relative">
        <button 
          onClick={() => setShowRiskInfo(!showRiskInfo)}
          className="absolute top-2 right-2 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200"
        >
          <FiInfo className="text-lg" />
        </button>
        <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
          Criterios de Evaluación
        </h3>
        
        {showRiskInfo && (
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p><strong className="text-blue-800 dark:text-blue-100">Edad:</strong> Menos de 30 (bajo), 30-50 (medio), Más de 50 (alto)</p>
            <p><strong className="text-blue-800 dark:text-blue-100">Licencias por enfermedad:</strong> 0-1 (bajo), 2-3 (medio), 4+ (alto)</p>
            <p><strong className="text-blue-800 dark:text-blue-100">Licencias por accidente:</strong> Cualquier cantidad aumenta riesgo</p>
            <p><strong className="text-blue-800 dark:text-blue-100">Departamentos de alto riesgo:</strong> Producción, Logística, Mantenimiento</p>
          </div>
        )}
        <p className="text-sm text-blue-700 dark:text-blue-300">
          El riesgo se calcula anualmente considerando edad, licencias médicas y departamento.
        </p>
      </div>

      {/* Search and filter */}
      <div className="bg-background rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar empleados por nombre, DNI o departamento..."
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-l-md focus:outline-none text-foreground bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 border border-l-0 border-border rounded-r-md bg-primary text-white hover:bg-primary-hover transition duration-200 cursor-pointer"
              disabled={loading}
            >
              Buscar
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-foreground">
            <FiFilter className="text-gray-400" />
            <select 
              className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-border focus:border-primary-border text-foreground bg-background"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={loading}
            >
              <option value="all">Todos</option>
              <option value="healthy">Bajo riesgo</option>
              <option value="warning">Riesgo medio</option>
              <option value="critical">Alto riesgo</option>
            </select>
          </div>
        </div>

        {/* Employees table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-card">
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
                    Riesgo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                    Última Evaluación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {
                    const status = getHealthStatusColors(employee.health_status);
                    return (
                      <tr key={employee.id} className="hover:bg-card">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${status.bg}`}>
                              {status.icon}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-foreground">
                                {employee.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {employee.position} | {employee.dni}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground">
                          {employee.age} años
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground">
                          {employee.sickLeavesLastYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground">
                          {employee.accidentLeavesLastYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bg} ${status.text}`}>
                            {employee.riskLevel} ({employee.riskScore.toFixed(1)})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-foreground">
                          {employee.lastEvaluation || 'Pendiente'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-foreground">
                      {searchTerm || filter !== 'all' 
                        ? 'No se encontraron empleados que coincidan con los filtros'
                        : 'No hay empleados registrados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Analysis confirmation */}
      <Confirmation
        isOpen={showAnalysisConfirmation}
        onClose={() => setShowAnalysisConfirmation(false)}
        onConfirm={confirmAnalysis}
        title="Evaluar Riesgo de Salud"
        message="¿Desea ejecutar la evaluación de riesgo de salud para todos los empleados? Esto actualizará los datos de riesgo."
        confirmText="Evaluar"
        cancelText="Cancelar"
        type="info"
      />

      {/* Notification */}
      {notification.show && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default HealthPredictions;