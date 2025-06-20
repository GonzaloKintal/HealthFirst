

import { useState, useEffect } from 'react';
import { 
  FiCpu, FiGitBranch, FiInfo, FiPlay, FiFilter, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { getAllMLModels, getActiveMLModels } from '../../services/machineLearningService';
import Confirmation from '../../components/utils/Confirmation';

const MachineLearningPage = () => {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showRetrainConfirmation, setShowRetrainConfirmation] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Cargar modelos desde el backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        let response;
        
        if (filter === 'active') {
          response = await getActiveMLModels();
          // Para modelos activos, no aplicamos paginación
          if (response.success) {
            setModels(response.data);
            setTotalPages(1);
            setTotalItems(response.data.length);
          }
        } else {
          response = await getAllMLModels({ 
            page: currentPage.toString(), 
            limit: itemsPerPage.toString() 
          });
          
          if (response.success) {
            setModels(response.data);
            // Asumiendo que el backend devuelve información sobre el total
            if (response.pagination) {
              setTotalPages(response.pagination.totalPages);
              setTotalItems(response.pagination.totalItems);
            } else {
              // Fallback: si no hay información de paginación, calculamos básicamente
              const hasNextPage = response.data.length === itemsPerPage;
              setTotalPages(hasNextPage ? currentPage + 1 : currentPage);
              setTotalItems(currentPage * itemsPerPage);
            }
          }
        }
        
        if (response.success) {
          if (response.data.length > 0) {
            setSelectedModel(response.data[0]);
          } else {
            setSelectedModel(null);
          }
        } else {
          setError(response.error);
        }
      } catch (err) {
        console.error('Error al cargar modelos:', err);
        setError('Error al cargar los modelos');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [filter, currentPage, itemsPerPage]);

  // Función para cambiar página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Función para cambiar filtro
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Resetear a página 1 cuando cambia el filtro
  };

  // Función para iniciar reentrenamiento
  const handleRetrain = () => {
    setShowRetrainConfirmation(true);
  };

  // Función para confirmar reentrenamiento
  const confirmRetrain = () => {
    setLoading(true);
    setShowRetrainConfirmation(false);
    console.log("Modelo reentrenado");
    // Aquí irá la conexión con la API en el futuro
    setLoading(false);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determinar estado del modelo para los badges
  const getModelStatus = (isActive) => {
    return isActive ? 'Activo' : 'No activo';
  };

  // Mapear tipo de modelo a nombre legible
  const getModelTypeName = (modelType) => {
    const types = {
      'CLASSIFICATION': 'Clasificación',
      'LICENSE_APPROVAL': 'Aprobación de licencias',
      'REJECTION_REASON': 'Motivos de rechazo'
    };
    return types[modelType] || modelType;
  };

  const PaginationControls = () => {
    if (filter === 'active' || totalPages <= 1) return null;
    
    return (
      <div className="w-full px-6 py-3 border-t border-border bg-card">
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2 mx-auto sm:mx-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center p-2 sm:px-3 sm:py-2 rounded-md transition duration-200 ${
                currentPage === 1
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-foreground hover:bg-accent'
              }`}
              aria-label="Página anterior"
            >
              <FiChevronLeft />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </button>
            
            {/* Números de página - solo en desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === currentPage;
                
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-md transition duration-200 ${
                        isCurrentPage
                          ? 'bg-primary text-white'
                          : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <span key={pageNumber} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center p-2 sm:px-3 sm:py-2 rounded-md transition duration-200 ${
                currentPage === totalPages
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-foreground hover:bg-accent'
              }`}
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline mr-1">Siguiente</span>
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-background p-6 rounded-lg shadow text-foreground">
        <p>Cargando modelos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background p-6 rounded-lg shadow text-foreground">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-background p-6 rounded-lg shadow text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
          <FiCpu className="mr-2" />
          Modelos de Machine Learning
        </h1>
      </div>

      <div className="mt-6 bg-card rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-6 flex items-center text-foreground">
            <FiGitBranch className="mr-2" />
            Listado de Modelos
            <button 
              onClick={() => setShowInfoModal(!showInfoModal)}
              className="ml-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors duration-200"
            >
              <FiInfo className="text-gray-700 dark:text-gray-200 text-lg" />
            </button>
          </h2>

          {showInfoModal && (
            <div className="mt-2 mb-10 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                Gestión de Modelos de Machine Learning
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
                <p>
                  Esta sección permite administrar los diferentes modelos predictivos que utiliza el sistema para analizar y procesar solicitudes de licencias.
                </p>

                <div className="space-y-2">
                  <p className="font-semibold text-blue-800 dark:text-blue-100">Funcionalidades clave:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Visualización de versiones:</strong> Consulta todas las versiones de modelos entrenados o filtra solo los activos en producción.</li>
                    <li><strong>Detalles técnicos:</strong> Revisa el algoritmo, tipo de modelo y fecha de entrenamiento de cada versión.</li>
                    <li><strong>Reentrenamiento:</strong> Inicia procesos para actualizar los modelos con nuevos datos.</li>
                    <li><strong>Gestión de estados:</strong> Identifica qué modelos están actualmente en uso.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-blue-800 dark:text-blue-100">Tipos de modelos disponibles:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Clasificación:</strong> Modelos genéricos para categorización de datos.</li>
                    <li><strong>Aprobación de licencias:</strong> Predictores especializados en evaluar solicitudes.</li>
                    <li><strong>Motivos de rechazo:</strong> Modelos que identifican patrones en solicitudes denegadas.</li>
                  </ul>
                </div>

                <p className="text-xs italic pt-2 border-t border-blue-200 dark:border-blue-700">
                  Nota: Los modelos activos son los que actualmente influyen en las decisiones del sistema. 
                  Las versiones anteriores se mantienen para referencia y posibles rollbacks.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-foreground mb-4">
            <FiFilter className="text-gray-400" />
            <select 
              className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-border focus:border-primary-border text-foreground bg-background"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              disabled={loading}
            >
              <option value="all">Ver todas las versiones</option>
              <option value="active">Ver solo versiones activas</option>
            </select>
          </div>
          
          {models.length > 0 ? (
            <div className="space-y-6">
              <div className="overflow-x-auto border rounded-lg border-border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-accent">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Versión</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Algoritmo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {models.map((model) => (
                      <tr 
                        key={model.id} 
                        className={`${selectedModel?.id === model.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-card dark:hover:bg-card-dark'} cursor-pointer transition duration-150`}
                        onClick={() => setSelectedModel(model)}
                      >
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-foreground">{model.version}</td>
                        <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-foreground">{model.name}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-foreground">{getModelTypeName(model.model_type)}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-foreground">{model.algorithm}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {getModelStatus(model.is_active) === 'Activo' ? (
                            <span className="bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full font-bold">Activo</span>
                          ) : (
                            <span className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full font-bold">No activo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Controles de paginación */}
              <PaginationControls />

              {selectedModel && (
                <div className="border rounded-lg p-6 border-border bg-card">
                  <h3 className="font-medium text-lg mb-4 text-foreground">Detalles del Modelo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-b border-border pb-4">
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium text-foreground">{selectedModel.name}</p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium text-foreground">{getModelTypeName(selectedModel.model_type)}</p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <p className="font-medium">
                        {getModelStatus(selectedModel.is_active) === 'Activo' ? (
                          <span className="bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full font-bold">Activo</span>
                        ) : (
                          <span className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full font-bold">No activo</span>
                        )}
                      </p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <p className="text-sm text-muted-foreground">Algoritmo</p>
                      <p className="font-medium text-foreground">{selectedModel.algorithm}</p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <p className="text-sm text-muted-foreground">Versión</p>
                      <p className="font-medium text-foreground">{selectedModel.version}</p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <p className="text-sm text-muted-foreground">Fecha de entrenamiento</p>
                      <p className="font-medium text-foreground">{formatDate(selectedModel.training_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleRetrain}
                      className="mt-6 flex items-center px-4 py-2 bg-primary rounded-md shadow-sm font-medium text-white hover:bg-primary-dark transition duration-200"
                      disabled={loading}
                    >
                      <FiPlay className="mr-2" />
                      Reentrenar modelo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiInfo className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium text-foreground">
                No hay modelos disponibles
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter === 'active' 
                  ? 'Actualmente no hay modelos activos en el sistema' 
                  : 'Actualmente no hay modelos entrenados en el sistema'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Confirmation
        isOpen={showRetrainConfirmation}
        onClose={() => setShowRetrainConfirmation(false)}
        onConfirm={confirmRetrain}
        title="Reentrenar Modelo"
        message={`¿Estás seguro que deseas reentrenar el "${selectedModel?.name}"? Esta acción puede tomar algún tiempo y consumirá recursos del sistema.`}
        confirmText="Reentrenar"
        cancelText="Cancelar"
        type="info"
      />

    </div>
  );
};

export default MachineLearningPage;