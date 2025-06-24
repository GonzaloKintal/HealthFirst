import { useState } from 'react';
import { FiAlertTriangle, FiUser, FiUsers } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import SupervisorAnomalies from '../../components/analyst/SupervisorAnomalies';
import EmployeeAnomalies from '../../components/analyst/EmployeeAnomalies';

const AnomaliesPage = () => {
  const { user } = useAuth();
  const [analysisType, setAnalysisType] = useState('supervisors');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
          <FiAlertTriangle className="mr-2" />
          Anomalías
        </h1>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-6 p-4 bg-special-light dark:bg-special-dark border-l-4 border-primary-border rounded">
          <p className="text-primary-text text-sm sm:text-base">
            <strong className="text-primary-text">Nota:</strong> Esta herramienta analiza los patrones de aprobación/rechazo de los supervisores y solicitudes de los empleados para detectar posibles anomalías.
          </p>
        </div>
      )}

      <Tabs 
        className="mt-6"
        selectedIndex={analysisType === 'supervisors' ? 0 : 1} 
        onSelect={(index) => setAnalysisType(index === 0 ? 'supervisors' : 'employees')}
      >
        <TabList className="flex flex-col sm:flex-row border-b border-border dark:border-border-dark">
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
                      border-t-2 border-l-2 border-r-2 rounded-t-lg mt-1 sm:mt-0
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
          <SupervisorAnomalies />
        </TabPanel>

        <TabPanel className="mt-2">
          <EmployeeAnomalies />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default AnomaliesPage;