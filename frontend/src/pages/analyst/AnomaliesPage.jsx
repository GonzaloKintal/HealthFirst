
import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiUser, FiUsers } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import SupervisorAnomalies from '../../components/analyst/SupervisorAnomalies';
import EmployeeAnomalies from '../../components/analyst/EmployeeAnomalies';

const AnomaliesPage = () => {
  const { user } = useAuth();
  const [analysisType, setAnalysisType] = useState('supervisors');
  const [supervisors, setSupervisors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  
  // Estados para mantener los datos analizados
  const [supervisorsData, setSupervisorsData] = useState(null);
  const [employeesData, setEmployeesData] = useState(null);
  const [lastAnalyzedSupervisors, setLastAnalyzedSupervisors] = useState(null);
  const [lastAnalyzedEmployees, setLastAnalyzedEmployees] = useState(null);

  // Obtener lista de supervisores y empleados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);
        
        // Simular llamadas a la API
        const mockSupervisors = [
          { id: 6, name: 'Juan Pérez', position: 'Supervisor Senior' },
          { id: 7, name: 'María García', position: 'Supervisor de Turno' },
          { id: 8, name: 'Carlos López', position: 'Supervisor de Área' },
          { id: 9, name: 'Ana Martínez', position: 'Supervisor Junior' },
          { id: 10, name: 'Pedro Rodríguez', position: 'Supervisor Nocturno' },
          { id: 11, name: 'Laura Sánchez', position: 'Supervisor de Calidad' },
          { id: 12, name: 'Diego Fernández', position: 'Supervisor de Equipo' },
        ];
        
        const mockEmployees = [
          { id: 101, name: 'Luis González', department: 'Ventas' },
          { id: 102, name: 'Marta Suárez', department: 'Marketing' },
          { id: 103, name: 'Jorge Ramírez', department: 'TI' },
          { id: 104, name: 'Sofía Castro', department: 'RRHH' },
          { id: 105, name: 'Pablo Méndez', department: 'Operaciones' },
        ];
        
        setSupervisors(mockSupervisors);
        setEmployees(mockEmployees);
      } catch (error) {
        console.error('Error obteniendo datos:', error);
        setDataError('Error al cargar la información de supervisores y empleados');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Manejar el análisis de supervisores
  const handleSupervisorsAnalyzed = (data, date) => {
    setSupervisorsData(data);
    setLastAnalyzedSupervisors(date);
  };

  // Manejar el análisis de empleados
  const handleEmployeesAnalyzed = (data, date) => {
    setEmployeesData(data);
    setLastAnalyzedEmployees(date);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-foreground">
          <FiAlertTriangle className="mr-2" />
          Anomalías
        </h1>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-6 p-4 bg-special-light dark:bg-special-dark border-l-4 border-primary-border rounded">
          <p className="text-primary-text">
            <strong className="text-primary-text">Nota:</strong> Esta herramienta analiza los patrones de aprobación/rechazo de los supervisores y solicitudes de los empleados para detectar posibles anomalías.
          </p>
        </div>
      )}

      {dataError && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {dataError}
        </div>
      )}

      <Tabs 
        className="mt-6"
        selectedIndex={analysisType === 'supervisors' ? 0 : 1} 
        onSelect={(index) => setAnalysisType(index === 0 ? 'supervisors' : 'employees')}
      >
        <TabList className="flex border-b border-border dark:border-border-dark">
          <Tab
            className={`px-4 py-2 mx-1 font-medium cursor-pointer focus:outline-none 
                      border-t-2 border-l-2 border-r-2 rounded-t-lg
                      ${analysisType === 'supervisors' 
                        ? 'bg-blue-50 text-blue-600 border-border border-b-white dark:bg-blue-900/30 dark:text-blue-300 dark:border-border-dark dark:border-b-card-dark' 
                        : 'text-foreground border-transparent hover:text-primary-text dark:text-foreground-dark dark:hover:text-primary-text-dark'}`}
          >
            <div className="flex items-center">
              <FiUser className="mr-2" />
              Supervisores
            </div>
          </Tab>
          <Tab
            className={`px-4 py-2 mx-1 font-medium cursor-pointer focus:outline-none 
                      border-t-2 border-l-2 border-r-2 rounded-t-lg
                      ${analysisType === 'employees' 
                        ? 'bg-blue-50 text-blue-600 border-border border-b-white dark:bg-blue-900/30 dark:text-blue-300 dark:border-border-dark dark:border-b-card-dark' 
                        : 'text-foreground border-transparent hover:text-primary-text dark:text-foreground-dark dark:hover:text-primary-text-dark'}`}
          >
            <div className="flex items-center">
              <FiUsers className="mr-2" />
              Empleados
            </div>
          </Tab>
        </TabList>

        <TabPanel className="mt-2">
          <SupervisorAnomalies 
            supervisors={supervisors} 
            isLoadingData={isLoadingData} 
            dataError={dataError}
            onAnalyzed={handleSupervisorsAnalyzed}
            initialData={supervisorsData}
            lastAnalyzed={lastAnalyzedSupervisors}
          />
        </TabPanel>

        <TabPanel className="mt-2">
          <EmployeeAnomalies 
            employees={employees} 
            isLoadingData={isLoadingData} 
            dataError={dataError}
            onAnalyzed={handleEmployeesAnalyzed}
            initialData={employeesData}
            lastAnalyzed={lastAnalyzedEmployees}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default AnomaliesPage;