

import { useState } from 'react';
import { FiUser, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import EmployeeSelector from '../supervisor/EmployeeSelector';
import { getIndividualHealthRiskPrediction } from '../../services/userService';

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

  const mapApiData = (employeeData) => {
    let health_status = 'critical';
    const risk = employeeData?.risk;

    if (typeof risk === 'string' && risk.toLowerCase() === 'low risk') {
      health_status = 'healthy';
    }

    return {
      id: employeeData.email || 'unknown',
      name: `${employeeData.first_name || ''} ${employeeData.last_name || ''}`.trim() || 'Sin Nombre',
      age: employeeData.age || 0,
      department: employeeData.in_high_risk_department ? 'Alto Riesgo' : 'Bajo Riesgo',
      sickLeaves: employeeData.sickness_license_count || 0,
      accidentLeaves: employeeData.accident_license_count || 0,
      riskLevel: risk ? (risk.toLowerCase() === 'low risk' ? 'Bajo Riesgo' : 'Alto Riesgo') : 'No evaluado',
      health_status
    };
  };

  const handleAnalyzeClick = async () => {
    if (!selectedEmployee) {
      setError('Por favor selecciona un empleado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const employeeData = await getIndividualHealthRiskPrediction(selectedEmployee);
      
      if (!employeeData) {
        throw new Error('No se encontraron datos del empleado seleccionado');
      }

      const result = {
        riskLevel: employeeData.risk === 'low risk' ? 'Bajo Riesgo' : 'Alto Riesgo',
        healthStatus: employeeData.risk === 'low risk' ? 'healthy' : 'critical',
        details: {
          age: employeeData.age,
          department: employeeData.in_high_risk_department ? 'Alto Riesgo' : 'Bajo Riesgo',
          sickLeaves: employeeData.sickness_license_count,
          accidentLeaves: employeeData.accident_license_count,
          email: employeeData.email,
          name: `${employeeData.first_name || ''} ${employeeData.last_name || ''}`.trim() || 'Sin Nombre'
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
        bg: 'bg-green-200 dark:bg-green-600/30', 
        text: 'text-green-600 dark:text-green-400',
        icon: <FiCheckCircle className="text-green-600 dark:text-green-400" />,
        label: 'Bajo Riesgo'
      },
      critical: { 
        bg: 'bg-red-200 dark:bg-red-600/30', 
        text: 'text-red-600 dark:text-red-400',
        icon: <FiAlertCircle className="text-red-600 dark:text-red-400" />,
        label: 'Alto Riesgo'
      }
    };
  
    return statusMap[status] || { 
      bg: 'bg-gray-100 dark:bg-gray-700/50', 
      text: 'text-gray-600 dark:text-gray-400',
      icon: <FiUser className="text-gray-500 dark:text-gray-400" />,
      label: 'No evaluado'
    };
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg h-full border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-medium text-foreground mb-6">Analizar un Empleado</h2>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-700/50 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
          <div className="bg-special-light dark:bg-special-dark p-3 rounded border-l-4 border-primary-border">
            <p className="text-primary-text text-sm">
              <strong className="text-primary-text">Nota:</strong> Este apartado permite analizar la salud de un empleado individualmente.
            </p>
          </div>
          
          <div className="mt-6">
            <EmployeeSelector
              selectedEmployee={selectedEmployee}
              onEmployeeSelected={handleEmployeeSelect}
              initialEmployees={employees}
              roles={['employee']}
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyzeClick}
              disabled={isLoading || !selectedEmployee}
              className={`px-4 py-2 rounded-md flex items-center text-sm font-medium ${
                isLoading || !selectedEmployee
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg shadow-sm border border-red-200 dark:border-red-700">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {analysisResult && (
          <div className="bg-white dark:bg-gray-700/50 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
            <h3 className="text-base font-medium text-foreground mb-4">Resultado del Análisis</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className={`p-4 rounded-full ${getHealthStatusStyle(analysisResult.healthStatus).bg}`}>
                  {getHealthStatusStyle(analysisResult.healthStatus).icon}
                </div>
              </div>
              
              <div className="text-center">
                <h4 className={`text-xl font-bold ${getHealthStatusStyle(analysisResult.healthStatus).text}`}>
                  {analysisResult.riskLevel}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {analysisResult.healthStatus === 'healthy' 
                    ? `El empleado ${analysisResult.details.name || 'seleccionado'} tiene bajo riesgo de salud.` 
                    : `El empleado ${analysisResult.details.name || 'seleccionado'} tiene alto riesgo de salud. Se recomienda tomar medidas preventivas.`}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre</div>
                  <div className="text-base font-medium text-foreground">{analysisResult.details.name}</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Edad</div>
                  <div className="text-base font-medium text-foreground">{analysisResult.details.age} años</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Departamento</div>
                  <div className="text-base font-medium text-foreground">{analysisResult.details.department}</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Licencias por enfermedad</div>
                  <div className="text-base font-medium text-foreground">{analysisResult.details.sickLeaves}</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Licencias por accidentes</div>
                  <div className="text-base font-medium text-foreground">{analysisResult.details.accidentLeaves}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualEmployeeAnalysis;