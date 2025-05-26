

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiDownload, FiEdit, FiTrash2, FiEye, FiPlus, FiFileText, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Confirmation from '../../components/utils/Confirmation';
import { Link } from 'react-router-dom';
import { getLicenses, deleteLicense, exportLicensesToCSV } from '../../services/licenseService';
import Notification from '../../components/utils/Notification';
import { formatSimpleDate } from '../../components/utils/FormattedDate';

const LicensesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showExportConfirmation, setShowExportConfirmation] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState(null);
  const canShowActions = ['admin', 'supervisor'].includes(user?.role);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalLicenses: 0
  });

  // Obtener licencias del backend con paginación
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoading(true)
        setError(null);
        const shouldShowAll = ['admin', 'supervisor'].includes(user?.role);
        const response = await getLicenses({ 
          user_id: user?.id,
          show_all_users: shouldShowAll,
          status: filter !== 'all' ? filter : null,
          employee_name: searchQuery,
          page: pagination.currentPage,
          page_size: 10
        });
        
        if (response.success) {
          const formattedLicenses = response.licenses.map(license => ({
            id: license.license_id,
            employee: license.user.first_name + ' ' + license.user.last_name,
            type: license.type,
            // startDate: license.start_date,
            // endDate: license.end_date,
            startDate: formatSimpleDate(license.start_date), // Formatear aquí
            endDate: formatSimpleDate(license.end_date),     // Formatear aquí
            days: license.days,
            status: license.status,
            requestedOn: license.created_at || '',
          }));
          
          setLicenses(formattedLicenses);
          setPagination({
            totalPages: response.pagination.totalPages || 1,
            currentPage: response.pagination.currentPage || 1,
            totalLicenses: response.pagination.totalLicenses || 0
          });
        } else {
          console.error('Error fetching licenses:', response.error);
          setLicenses([]);
          setError(response.error || 'No se pudieron cargar las licencias. Por favor intenta nuevamente.');
          setPagination({
            totalPages: 1,
            currentPage: 1,
            totalLicenses: 0
          });
        }
      } catch (error) {
        console.error('Error fetching licenses:', error);
        setLicenses([]);
        setError('No se pudieron cargar las licencias. Por favor intenta nuevamente.');
        setPagination({
          totalPages: 1,
          currentPage: 1,
          totalLicenses: 0
        });
      } finally {
        setLoading(false);
      }
    };
  
    if (user?.id) {
      fetchLicenses();
    }
  }, [user, filter, pagination.currentPage, searchQuery]);

  // Función para búsqueda manual (con Enter o botón)
  const handleSearch = () => {
    try {
      setError(null);
      setSearchQuery(searchTerm);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al realizar la búsqueda');
    }
  };
  
  // Manejar la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  const handleDelete = (id) => {
    setLicenseToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    let previousLicenses = [];
    let previousPagination = {};
    
    try {
      previousLicenses = [...licenses];
      previousPagination = {...pagination};
      
      // Actualización optimista
      setLicenses(previousLicenses.filter(license => license.id !== licenseToDelete));
      setPagination(prev => ({
        ...prev,
        totalLicenses: prev.totalLicenses - 1
      }));
      
      await deleteLicense(licenseToDelete);
      
      // Si la página queda vacía y no estamos en la primera página, retroceder
      const licensesLeftInPage = previousLicenses.filter(license => license.id !== licenseToDelete).length;
      if (licensesLeftInPage === 0 && previousPagination.currentPage > 1) {
        setPagination(prev => ({
          ...prev,
          currentPage: prev.currentPage - 1
        }));
      }
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Licencia eliminada con éxito.'
      });
      
    } catch (error) {
      console.error('Error al eliminar licencia:', error);
      setLicenses(previousLicenses);
      setPagination(previousPagination);
      setNotification({
        show: true,
        type: 'error',
        message: 'No se pudo eliminar la licencia. Por favor intenta nuevamente.'
      });
    } finally {
      setShowDeleteConfirmation(false);
      setLicenseToDelete(null);
    }
  };

  const handleViewDetails = (licenseId) => {
    navigate(`/license-detail/${licenseId}`);
  };

  const handleExportClick = () => {
    if (licenses.length === 0) return;
    setShowExportConfirmation(true);
  };

  const confirmExport = async () => {
    setShowExportConfirmation(false);
    try {
      const shouldShowAll = ['admin', 'supervisor'].includes(user?.role);
      const exportFilters = {
        user_id: user?.id,
        show_all_users: shouldShowAll,
        status: filter !== 'all' ? filter : null,
        employee_name: searchQuery
      };
  
      const result = await exportLicensesToCSV(exportFilters);
      
      if (!result.success) {
        setNotification({
          show: true,
          type: 'error',
          message: result.error || 'Error al exportar las licencias'
        });
      }
    } catch (error) {
      console.error('Error exporting licenses:', error);
      setNotification({
        show: true,
        type: 'error',
        message: error.message || 'Error al exportar las licencias'
      });
    }
  };

  const getStatusColors = (status) => {
    const lightColors = {
      approved: { 
        bg: 'bg-green-100', 
        text: 'text-green-800' 
      },
      rejected: { 
        bg: 'bg-[var(--rejected-bg-light)]', 
        text: 'text-[var(--rejected-text-light)]' 
      },
      pending: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800' 
      },
      missing_doc: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800'
      },
      expired: {
        bg: 'bg-red-100',
        text: 'text-red-800'
      },
      default: { 
        bg: 'bg-gray-100', 
        text: 'text-foreground' 
      }
    };
  
    const darkColors = {
      approved: { 
        bg: 'dark:bg-green-900', 
        text: 'dark:text-green-200' 
      },
      rejected: { 
        bg: 'dark:bg-[var(--rejected-bg-dark)]', 
        text: 'dark:text-[var(--rejected-text-dark)]' 
      },
      pending: { 
        bg: 'dark:bg-blue-700', 
        text: 'dark:text-blue-100' 
      },
      missing_doc: {
        bg: 'dark:bg-yellow-700',
        text: 'dark:text-yellow-100'
      },
      expired: {
        bg: 'dark:bg-red-900',
        text: 'dark:text-red-200'
      }
    };
  
    const colors = {
      approved: {
        bg: `${lightColors.approved.bg} ${darkColors.approved.bg}`,
        text: `${lightColors.approved.text} ${darkColors.approved.text}`
      },
      rejected: {
        bg: `${lightColors.rejected.bg} ${darkColors.rejected.bg}`,
        text: `${lightColors.rejected.text} ${darkColors.rejected.text}`
      },
      pending: {
        bg: `${lightColors.pending.bg} ${darkColors.pending.bg}`,
        text: `${lightColors.pending.text} ${darkColors.pending.text}`
      },
      missing_doc: {
        bg: `${lightColors.missing_doc.bg} ${darkColors.missing_doc.bg}`,
        text: `${lightColors.missing_doc.text} ${darkColors.missing_doc.text}`
      },
      expired: {
        bg: `${lightColors.expired.bg} ${darkColors.expired.bg}`,
        text: `${lightColors.expired.text} ${darkColors.expired.text}`
      },
      default: {
        bg: `${lightColors.default.bg} dark:bg-gray-800`,
        text: lightColors.default.text
      }
    };
  
    return colors[status] || colors.default;
  };

  const translateStatus = (status) => {
    const statusMap = {
      approved: 'Aprobada',
      rejected: 'Rechazada',
      pending: 'Pendiente',
      missing_doc: 'Falta certificado',
      expired: 'Expirada'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="p-6 relative">
      {/* Contenido principal - siempre visible */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-foreground">
          <FiFileText className="mr-2" />
          Gestión de Licencias
        </h1>
        <div className="flex space-x-3">
          <Link
            to="/request-license"
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
          >
            <FiPlus className="mr-2" />
            Solicitar Nueva
          </Link>
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <button 
              onClick={handleExportClick}
              className="flex items-center px-4 py-2 bg-primary text-white font-medium rounded-md cursor-pointer hover:bg-primary-hover transition duration-200"
              disabled={licenses.length === 0 || loading}
            >
              <FiDownload className="mr-2" />
              Exportar
            </button> 
          )}
        </div>
      </div>
  
      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}
  
      {/* Barra de búsqueda y filtro */}
      <div className="bg-background rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <div className="relative flex-grow flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar empleado por nombre o apellido..."
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
          )}
          
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select 
              className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-border focus:border-primary-border text-foreground bg-background"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              disabled={loading}
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="missing_doc">Falta certificado</option>
              <option value="expired">Expiradas</option>
            </select>
          </div>
        </div>
  
        <div className="overflow-x-auto">
          {loading ? (
            // Mostrar spinner centrado en el área de la tabla
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            // Mostrar tabla cuando no está loading
            <>
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-card">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Empleado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Días</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Detalle</th>
                    {canShowActions && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {licenses.length > 0 ? (
                    licenses.map((license) => (
                      <tr key={license.id} className='text-center'>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-foreground">{license.employee}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground capitalize">{license.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {license.startDate} al {license.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{license.days}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusColors(license.status).bg
                          } ${
                            getStatusColors(license.status).text
                          }`}>
                            {translateStatus(license.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(license.id)}
                            className="text-primary-text hover:text-primary-hover p-1 rounded hover:bg-blue-50 cursor-pointer flex items-center mx-auto"
                            title="Ver detalle"
                          >
                            <FiEye size={18} className="mr-1" />
                            <span>Detalle</span>
                          </button>
                        </td>
                        
                        {canShowActions && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-3 justify-center">
                              <Link
                                to={`/edit-license/${license.id}`}
                                className="text-primary-text hover:text-primary-hover p-1 rounded hover:bg-blue-50 cursor-pointer"
                              >
                                <FiEdit size={18} />
                              </Link>
  
                              {user?.role === 'admin' && (
                                <button 
                                  onClick={() => handleDelete(license.id)}
                                  className="text-red-500 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
                                  title="Eliminar"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={canShowActions ? 7 : 6} className="px-6 py-4 text-center text-foreground">
                        {searchQuery || filter !== 'all' 
                          ? 'No se encontraron licencias que coincidan con los filtros'
                          : 'No hay licencias registradas'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
  
            </>
          )}
        </div>
      </div>
      
      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 rounded-l-md border border-border bg-background text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
            >
              <FiChevronLeft className="mr-1" /> Anterior
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 border-t border-b border-border text-sm font-medium ${
                  pagination.currentPage === i + 1
                    ? 'bg-blue-50 text-primary-text'
                    : 'bg-background text-foreground hover:bg-card'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 rounded-r-md border border-border bg-background text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
            >
              Siguiente <FiChevronRight className="ml-1" />
            </button>
          </nav>
        </div>
      )}
  
      <Confirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Eliminar Licencia"
        message="¿Estás seguro que deseas eliminar esta licencia? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
  
      <Confirmation
        isOpen={showExportConfirmation}
        onClose={() => setShowExportConfirmation(false)}
        onConfirm={confirmExport}
        title="Exportar Licencias"
        message="¿Desea exportar las licencias con los filtros actuales?"
        confirmText="Exportar"
        cancelText="Cancelar"
        type="info"
      />
  
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ show: false, type: '', message: '' })}
        />
      )}
    </div>
  );
}

export default LicensesPage;