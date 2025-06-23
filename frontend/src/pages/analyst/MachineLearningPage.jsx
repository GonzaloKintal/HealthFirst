

import { useState, useEffect } from 'react';
import { 
  FiCpu, FiGitBranch, FiInfo, FiPlay, FiFilter, 
  FiChevronLeft, FiChevronRight, FiActivity, FiCalendar, FiCode
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { 
  getAllMLModels, 
  getActiveMLModels, 
  retrainMLModel 
} from '../../services/machineLearningService';
import Confirmation from '../../components/utils/Confirmation';
import Notification from '../../components/utils/Notification';
import MLModelsSkeleton from '../../components/analyst/MLModelSkeleton';
import Select from 'react-select';
import { customStyles } from '../../components/utils/utils';

// Función auxiliar para simular un retraso mínimo
const withMinDelay = async (promise, minDelay = 1000) => {
  const [result] = await Promise.all([
    promise,
    new Promise(resolve => setTimeout(resolve, minDelay))
  ]);
  return result;
};

const MachineLearningPage = () => {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showRetrainConfirmation, setShowRetrainConfirmation] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 5
  });

  // Cargar modelos desde el backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        if (!loading) setTableLoading(true);
        setError(null);
        let response;
        
        if (filter === 'active') {
          response = await withMinDelay(getActiveMLModels());
          if (response.success) {
            setModels(response.data.models || []);
            setPagination(prev => ({
              ...prev,
              totalPages: 1,
              currentPage: 1,
              totalItems: response.data.models?.length || 0
            }));
          } else {
            throw new Error(response.error);
          }
        } else {
          response = await withMinDelay(getAllMLModels({ 
            page: pagination.currentPage, 
            limit: pagination.itemsPerPage 
          }));
          
          if (response.success) {
            setModels(response.data.models || []);
            setPagination(prev => ({
              ...prev,
              totalPages: response.data.num_pages || 1,
              currentPage: response.data.current_page || 1,
              totalItems: response.data.total || 0
            }));
          } else {
            throw new Error(response.error);
          }
        }
        
        if (response?.data?.models?.length > 0) {
          setSelectedModel(response.data.models[0]);
        } else {
          setSelectedModel(null);
        }
      } catch (err) {
        console.error('Error al cargar modelos:', err);
        setError(err.message);
        showNotification('error', err.message);
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    };

    fetchModels();
  }, [filter, pagination.currentPage, pagination.itemsPerPage]);

  // Cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  // Cambiar filtro
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Iniciar reentrenamiento
  const handleRetrain = () => {
    setShowRetrainConfirmation(true);
  };

  // Confirmar reentrenamiento
  const confirmRetrain = async () => {
    try {
      setTableLoading(true);
      setShowRetrainConfirmation(false);
      
      if (!selectedModel) return;
      
      const response = await withMinDelay(retrainMLModel(selectedModel.model_type));
      
      if (response.success) {
        showNotification('success', `Modelo "${selectedModel.name}" entrenado con éxito.`);
        
        if (filter === 'active') {
          const fetchResponse = await withMinDelay(getActiveMLModels());
          if (fetchResponse.success) {
            setModels(fetchResponse.data.models || []);
            if (fetchResponse.data.models?.length > 0) {
              setSelectedModel(fetchResponse.data.models[0]);
            }
          }
        } else {
          const fetchResponse = await withMinDelay(getAllMLModels({ 
            page: pagination.currentPage, 
            limit: pagination.itemsPerPage 
          }));
          if (fetchResponse.success) {
            setModels(fetchResponse.data.models || []);
            setPagination(prev => ({
              ...prev,
              totalPages: fetchResponse.data.num_pages || 1,
              totalItems: fetchResponse.data.total || 0
            }));
            if (fetchResponse.data.models?.length > 0) {
              setSelectedModel(fetchResponse.data.models[0]);
            }
          }
        }
      } else {
        throw new Error(response.error || 'Error al reentrenar el modelo');
      }
    } catch (err) {
      console.error("Error en el proceso de reentrenamiento:", err);
      showNotification('error', err.message);
    } finally {
      setTableLoading(false);
    }
  };

  // Mostrar notificación
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Mapear tipo de modelo a nombre legible
  const getModelTypeName = (modelType) => {
    const types = {
      'CLASSIFICATION': 'Clasificación',
      'LICENSE_APPROVAL': 'Aprobación de licencias',
      'REJECTION_REASON': 'Motivos de rechazo',
      'HEALTH_RISK': 'Riesgo de salud',
      'EMPLOYEE_ANOMALY_DETECTION': 'Detección de anomalías en empleados',
      'SUPERVISOR_ANOMALY_DETECTION': 'Detección de anomalías en supervisores',
    };
    return types[modelType] || modelType;
  };

  // Verificar si un modelo puede ser reentrenado
  const canRetrainModel = (modelType) => {
    const nonRetrainableModels = ['HEALTH_RISK', 'EMPLOYEE_ANOMALY_DETECTION', 'SUPERVISOR_ANOMALY_DETECTION'];
    return !nonRetrainableModels.includes(modelType);
  };

  // Obtener colores para el estado del modelo
  const getStatusColors = (isActive) => {
    return isActive 
      ? { bg: 'bg-green-200 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' }
      : { bg: 'bg-red-200 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' };
  };

  // Define options for status filter
  const filterOptions = [
    { value: 'all', label: 'Todas las versiones' },
    { value: 'active', label: 'Solo versiones activas' }
  ];

  if (loading) {
    return <MLModelsSkeleton />;
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3 md:gap-0">
        <h1 className="text-xl sm:text-2xl text-foreground font-bold flex items-center">
          <FiCpu className="mr-2" />
          Modelos de Machine Learning
        </h1>
        
        <div className="flex flex-col xs:flex-row md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          {/* Botón de información */}
          <button 
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors duration-200 order-1 md:order-none"
          >
            <FiInfo className="text-gray-700 dark:text-gray-200 text-2xl" />
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {/* Modal de información */}
      {showInfoModal && (
        <div className="mt-2 mb-10 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
            Gestión de Modelos de Machine Learning
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
            <p>
              Esta sección permite administrar los diferentes modelos predictivos que utiliza el sistema para analizar datos de empleados y procesos organizacionales.
            </p>

            <div className="space-y-2">
              <p className="font-semibold text-blue-800 dark:text-blue-100">Funcionalidades clave:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Visualización de versiones:</strong> Consulta todas las versiones de modelos entrenados o filtra solo los activos en producción.</li>
                <li><strong>Detalles técnicos:</strong> Revisa el algoritmo, tipo de modelo y fecha de entrenamiento de cada versión.</li>
                <li><strong>Reentrenamiento:</strong> Inicia procesos para actualizar los modelos con nuevos datos (disponible para algunos tipos de modelos).</li>
                <li><strong>Gestión de estados:</strong> Identifica qué modelos están actualmente en uso.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-blue-800 dark:text-blue-100">Tipos de modelos disponibles:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Clasificación:</strong> Modelos genéricos para categorización de datos.
                </li>
                <li>
                  <strong>Aprobación de licencias:</strong> Predictores especializados en evaluar solicitudes de licencias médicas y permisos.
                </li>
                <li>
                  <strong>Motivos de rechazo:</strong> Modelos que identifican patrones en solicitudes denegadas para mejorar los procesos.
                </li>
                <li>
                  <strong>Riesgo de salud:</strong> Modelos predictivos que evalúan el riesgo de salud de los empleados basado en múltiples factores.
                </li>
                <li>
                  <strong>Detección de anomalías en empleados:</strong> Identifican comportamientos o patrones inusuales en los datos de empleados.
                </li>
                <li>
                  <strong>Detección de anomalías en supervisores:</strong> Detectan patrones inusuales en las decisiones y comportamientos de los supervisores.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-blue-800 dark:text-blue-100">Notas importantes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Los modelos de <strong>Riesgo de salud</strong> y <strong>Detección de anomalías</strong> no pueden ser reentrenados manualmente.</li>
                <li>Los modelos activos son los que actualmente influyen en las decisiones del sistema.</li>
                <li>Las versiones anteriores se mantienen para referencia y posibles rollbacks.</li>
              </ul>
            </div>

            <p className="text-xs italic pt-2 border-t border-blue-200 dark:border-blue-700">
              Nota técnica: Los modelos se actualizan automáticamente según la programación establecida por el equipo de ciencia de datos.
            </p>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-background rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-medium mb-4 flex items-center text-foreground">
            <FiGitBranch className="mr-2" />
            Listado de Modelos
          </h2>

          {/* Filtros */}
          <div className="flex items-center space-x-2 text-foreground mb-4 w-full sm:w-52">
            <FiFilter className="text-gray-400" />
            <Select
              options={filterOptions}
              value={filterOptions.find(option => option.value === filter)}
              onChange={(selectedOption) => handleFilterChange(selectedOption.value)}
              styles={customStyles}
              isSearchable={false}
              className="text-sm"
              classNamePrefix="select"
              menuPlacement="auto"
              menuPosition="fixed"
              isLoading={tableLoading}
              isDisabled={tableLoading}
            />
          </div>
        </div>

        {/* Vista de tabla y cards */}
        {tableLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : models.length > 0 ? (
          <>
            {/* Vista de tabla - Solo visible en md y superiores */}
            <div className="hidden md:block overflow-x-auto relative">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-card">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Versión</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Algoritmo</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {models.map((model) => (
                    <tr 
                      key={model.id} 
                      className={`${selectedModel?.id === model.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-card'} cursor-pointer transition duration-150`}
                      onClick={() => setSelectedModel(model)}
                    >
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-foreground">{model.version}</td>
                      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-foreground">{model.name}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-foreground">{getModelTypeName(model.model_type)}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-foreground">{model.algorithm}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColors(model.is_active).bg} ${getStatusColors(model.is_active).text}`}>
                          {model.is_active ? 'Activo' : 'No activo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de cards - Solo visible en pantallas pequeñas */}
            <div className="md:hidden">
              <div className="divide-y divide-border">
                {models.map((model) => (
                  <div 
                    key={model.id} 
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedModel?.id === model.id 
                        ? 'bg-blue-50 dark:bg-blue-950' 
                        : 'hover:bg-card'
                    }`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icono del modelo */}
                      <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                        model.is_active 
                          ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200' 
                          : 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200'
                      }`}>
                        <FiCpu className="text-lg" />
                      </div>
                      
                      {/* Contenido principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                          <h3 className="text-sm font-semibold text-foreground pr-2">
                            {model.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 mt-1 sm:mt-0 ${getStatusColors(model.is_active).bg} ${getStatusColors(model.is_active).text}`}>
                            {model.is_active ? 'Activo' : 'No activo'}
                          </span>
                        </div>
                        
                        {/* Información del modelo */}
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-foreground opacity-75">
                            <FiActivity className="mr-2 flex-shrink-0" />
                            <span>Tipo: {getModelTypeName(model.model_type)}</span>
                          </div>
                          <div className="flex items-center text-xs text-foreground opacity-75">
                            <FiCode className="mr-2 flex-shrink-0" />
                            <span>Algoritmo: {model.algorithm}</span>
                          </div>
                          <div className="flex items-center text-xs text-foreground opacity-75">
                            <FiCalendar className="mr-2 flex-shrink-0" />
                            <span>Versión: {model.version}</span>
                          </div>
                        </div>
                        
                        {/* Indicador de selección */}
                        {selectedModel?.id === model.id && (
                          <div className="mt-2">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              ● Modelo seleccionado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FiInfo className="mx-auto h-12 w-12 text-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">
              No hay modelos disponibles
            </h3>
            <p className="mt-1 text-sm text-foreground">
              {filter === 'active' 
                ? 'Actualmente no hay modelos activos en el sistema' 
                : 'Actualmente no hay modelos entrenados en el sistema'}
            </p>
          </div>
        )}

        {/* Paginación */}
        {!tableLoading && pagination.totalPages > 1 && filter !== 'active' && (
          <div className="flex justify-center p-4 border-t border-border">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || tableLoading}
                className="px-2 sm:px-3 py-2 rounded-l-md border border-border bg-background text-xs sm:text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
              >
                <FiChevronLeft className="mr-1" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-2 sm:px-3 py-2 border-t border-b border-border text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    pagination.currentPage === i + 1
                      ? 'bg-special-light dark:bg-special-dark text-primary-text hover:bg-primary-hover/20 dark:hover:bg-primary-hover/30'
                      : 'bg-background text-foreground hover:bg-card'
                  } ${tableLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={tableLoading}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || tableLoading}
                className="px-2 sm:px-3 py-2 rounded-r-md border border-border bg-background text-xs sm:text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <FiChevronRight className="ml-1" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Detalles del modelo seleccionado */}
      {selectedModel && (
        <div className="bg-background rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-medium mb-4 text-foreground">Detalles del Modelo</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b border-border pb-4">
                <p className="text-sm text-foreground opacity-75">Nombre</p>
                <p className="font-medium text-foreground">{selectedModel.name}</p>
              </div>
              <div className="border-b border-border pb-4">
                <p className="text-sm text-foreground opacity-75">Tipo</p>
                <p className="font-medium text-foreground">{getModelTypeName(selectedModel.model_type)}</p>
              </div>
              <div className="border-b border-border pb-4">
                <p className="text-sm text-foreground opacity-75">Estado</p>
                <p className="font-medium">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColors(selectedModel.is_active).bg} ${getStatusColors(selectedModel.is_active).text}`}>
                    {selectedModel.is_active ? 'Activo' : 'No activo'}
                  </span>
                </p>
              </div>
              <div className="border-b border-border pb-4">
                <p className="text-sm text-foreground opacity-75">Algoritmo</p>
                <p className="font-medium text-foreground">{selectedModel.algorithm}</p>
              </div>
              <div className="border-b border-border pb-4">
                <p className="text-sm text-foreground opacity-75">Versión</p>
                <p className="font-medium text-foreground">{selectedModel.version}</p>
              </div>
              <div className="border-b border-border pb-4">
                <p className="text-sm text-foreground opacity-75">Fecha de entrenamiento</p>
                <p className="font-medium text-foreground">{formatDate(selectedModel.training_date)}</p>
              </div>
              <div className="border-b border-border pb-4 sm:col-span-2">
                <p className="text-sm text-foreground opacity-75">Último registro de entrenamiento</p>
                <p className="font-medium text-foreground">
                  {selectedModel.last_training_id || 'No disponible'}
                </p>
              </div>
            </div>
            
            {canRetrainModel(selectedModel.model_type) && (
              <div className="mt-6">
                <button 
                  onClick={handleRetrain}
                  className="flex items-center px-4 py-2 bg-primary rounded-md shadow-sm font-medium text-white hover:bg-primary-dark transition duration-200 text-sm"
                  disabled={tableLoading}
                >
                  <FiPlay className="mr-2" />
                  Reentrenar modelo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmación de reentrenamiento */}
      <Confirmation
        isOpen={showRetrainConfirmation}
        onClose={() => setShowRetrainConfirmation(false)}
        onConfirm={confirmRetrain}
        title="Reentrenar Modelo"
        message={`¿Estás seguro que deseas reentrenar el modelo "${selectedModel?.name}"? Esta acción puede tomar algún tiempo.`}
        confirmText="Reentrenar"
        cancelText="Cancelar"
        type="info"
      />

      {/* Notificación */}
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

export default MachineLearningPage;