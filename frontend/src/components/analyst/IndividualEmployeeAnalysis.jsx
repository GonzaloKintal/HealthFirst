import { useState } from 'react';
import { FiUser, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import EmployeeSelector from '../supervisor/EmployeeSelector';

const IndividualEmployeeAnalysis = ({ 
  employees, 
  onAnalyzeEmployee,
  isDarkMode 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployee(employeeId);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyzeClick = async () => {
    if (!selectedEmployee) {
      setError('Por favor selecciona un empleado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const employeeData = employees.find(emp => emp.id === selectedEmployee);
      
      if (!employeeData) {
        throw new Error('No se encontraron datos del empleado seleccionado');
      }

      // Aquí podrías llamar a una API específica para análisis individual
      // Pero por ahora usaremos los datos que ya tenemos
      const result = {
        riskLevel: employeeData.riskLevel,
        healthStatus: employeeData.health_status,
        details: {
          age: employeeData.age,
          department: employeeData.department,
          sickLeaves: employeeData.sickLeaves,
          accidentLeaves: employeeData.accidentLeaves
        }
      };

      setAnalysisResult(result);
      
      if (onAnalyzeEmployee) {
        await onAnalyzeEmployee(employeeData);
      }
    } catch (err) {
      setError(err.message || 'Error al analizar empleado');
      console.error('Error analyzing employee:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="mt-12 bg-background dark:bg-background-dark rounded-lg shadow overflow-hidden border border-border dark:border-border-dark">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          Analizar un Empleado
        </h2>
        
        <div className="space-y-6">
          <div className="bg-card dark:bg-card-dark p-6 rounded-lg border border-border dark:border-border-dark">

            <div className="mt-6 mb-6 p-3 bg-special-light dark:bg-special-dark border-l-4 border-primary-border rounded">
                <p className="text-primary-text">
                    <strong className="text-primary-text">Nota:</strong> Este apartado permite analizar la salud de un empleado individualmente.
                </p>
            </div>
            
            <EmployeeSelector
              selectedEmployee={selectedEmployee}
              onEmployeeSelected={handleEmployeeSelect}
              initialEmployees={employees.map(emp => ({ 
                id: emp.id, 
                name: emp.name 
              }))}
              roles={['employee']}
            />
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAnalyzeClick}
                disabled={isLoading || !selectedEmployee}
                className={`px-4 py-2 rounded-md flex items-center ${
                  isLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : !selectedEmployee
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analizando...
                  </>
                ) : (
                  'Analizar Empleado'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
              {error}
            </div>
          )}

          {analysisResult && (
            <div className="bg-card dark:bg-card-dark p-6 rounded-lg border border-border dark:border-border-dark">
              <h3 className="font-medium text-foreground mb-4">Resultado del Análisis</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className={`p-4 rounded-full ${getHealthStatusStyle(analysisResult.healthStatus).bg}`}>
                    {getHealthStatusStyle(analysisResult.healthStatus).icon}
                  </div>
                </div>
                
                <div className="text-center">
                  <h4 className={`text-xl font-bold ${getHealthStatusStyle(analysisResult.healthStatus).text}`}>
                    {analysisResult.riskLevel}
                  </h4>
                  <p className="text-foreground mt-1">
                    {analysisResult.healthStatus === 'healthy' 
                      ? 'El empleado tiene bajo riesgo de salud' 
                      : 'El empleado tiene alto riesgo de salud'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Edad</p>
                    <p className="text-lg font-medium text-foreground">{analysisResult.details.age} años</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Departamento</p>
                    <p className="text-lg font-medium text-foreground">{analysisResult.details.department}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Licencias por enfermedad</p>
                    <p className="text-lg font-medium text-foreground">{analysisResult.details.sickLeaves}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Licencias por accidentes</p>
                    <p className="text-lg font-medium text-foreground">{analysisResult.details.accidentLeaves}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualEmployeeAnalysis;