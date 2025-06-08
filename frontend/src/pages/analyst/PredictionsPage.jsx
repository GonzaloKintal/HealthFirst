import { useState } from 'react';
import { FiActivity, FiAlertTriangle, FiHeart, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Anomalies from './Anomalies';
import HealthPredictions from './HealthPredictions';

const PredictionsPage = () => {
  const [expandedSection, setExpandedSection] = useState('');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
          <FiActivity className="mr-2" />
          Panel de Predicciones
        </h1>
      </div>

      {/* Sección de Anomalías */}
      <div className="mb-6 overflow-hidden rounded-lg shadow-sm border border-border">
        <button
          onClick={() => setExpandedSection(expandedSection === 'anomalies' ? '' : 'anomalies')}
          className="w-full flex justify-between items-center p-4 bg-background transition-colors hover:bg-card"
        >
          <div className="flex items-center">
            <FiAlertTriangle className="mr-2 text-blue-500" />
            <h2 className="text-lg font-semibold text-foreground">Análisis de Anomalías</h2>
          </div>
          <span className="text-foreground">
            {expandedSection === 'anomalies' ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSection === 'anomalies' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-4 bg-background border-t border-border">
            <Anomalies />
          </div>
        </div>
      </div>

      {/* Sección de Salud Laboral */}
      <div className="overflow-hidden rounded-lg shadow-sm border border-border">
        <button
          onClick={() => setExpandedSection(expandedSection === 'health' ? '' : 'health')}
          className="w-full flex justify-between items-center p-4 bg-background transition-colors hover:bg-card"
        >
          <div className="flex items-center">
            <FiHeart className="mr-2 text-green-500" />
            <h2 className="text-lg font-semibold text-foreground">Predicciones de Salud Laboral</h2>
          </div>
          <span className="text-foreground">
            {expandedSection === 'health' ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSection === 'health' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-4 bg-background border-t border-border">
            <HealthPredictions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;