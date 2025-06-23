
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiDownload, FiEdit, FiTrash2, FiEye, FiPlus, FiFileText, FiChevronLeft, FiChevronRight, FiUser, FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Confirmation from '../../components/utils/Confirmation';
import { Link } from 'react-router-dom';
import { getLicenses, deleteLicense, exportLicensesToCSV, getLicenseTypes } from '../../services/licenseService';
import Notification from '../../components/utils/Notification';
import { formatSimpleDate } from '../../components/utils/FormattedDate';
import Select from 'react-select';
import { customStyles } from '../../components/utils/utils';

const LicensesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
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

  // Auto-dismiss notifications after 3 seconds, like RequestLicense
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Fetch license types
  useEffect(() => {
    const fetchLicenseTypes = async () => {
      try {
        const response = await getLicenseTypes();
        if (response.success) {
          setLicenseTypes(response.data.types);
        } else {
          console.error('Error al obtener tipos de licencia:', response.error);
          setNotification({
            show: true,
            type: 'error',
            message: 'Error al cargar los tipos de licencia disponibles'
          });
          setLicenseTypes([]);
        }
      } catch (error) {
        console.error('Error fetching license types:', error);
        setNotification({
          show: true,
          type: 'error',
          message: 'Error al cargar los tipos de licencia'
        });
        setLicenseTypes([]);
      }
    };

    fetchLicenseTypes();
  }, []);

  // Fetch licenses with pagination
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoading(true);
        setError(null);
        const shouldShowAll = ['admin', 'supervisor'].includes(user?.role);
        const response = await getLicenses({ 
          user_id: user?.id,
          show_all_users: shouldShowAll,
          status: filter !== 'all' ? filter : null,
          type: typeFilter !== 'all' ? typeFilter : null,
          employee_name: searchQuery,
          page: pagination.currentPage,
          page_size: 10
        });
        
        if (response.success) {
          const formattedLicenses = response.licenses.map(license => ({
            id: license.license_id,
            employee: license.user.first_name + ' ' + license.user.last_name,
            type: license.type,
            startDate: formatSimpleDate(license.start_date),
            endDate: formatSimpleDate(license.end_date),
            status: license.status,
            days: license.days,
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
  }, [user, filter, typeFilter, pagination.currentPage, searchQuery]);

  // Handle manual search (Enter or button)
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
  
  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Change page
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
      
      // Optimistic update
      setLicenses(previousLicenses.filter(license => license.id !== licenseToDelete));
      setPagination(prev => ({
        ...prev,
        totalLicenses: prev.totalLicenses - 1
      }));
      
      await deleteLicense(licenseToDelete);
      
      // If page is empty and not on first page, go back
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
        type: typeFilter !== 'all' ? typeFilter : null,
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
        bg: 'bg-red-900',
        text: 'text-red-200'
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
        bg: 'dark:bg-red-100',
        text: 'dark:text-red-800'
      },
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

  // Define options for status filter
  const statusFilterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'approved', label: 'Aprobadas' },
    { value: 'rejected', label: 'Rechazadas' },
    { value: 'missing_doc', label: 'Falta certificado' },
    { value: 'expired', label: 'Expiradas' }
  ];

  // Define options for type filter
  const typeFilterOptions = [
    { value: 'all', label: 'Todos los tipos' },
    ...licenseTypes.map(type => ({
      value: type.name,
      label: type.name
    }))
  ];

  return (
    <div className="p-3 sm:p-6">
      {/* Encabezado y contador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3 md:gap-0">
        <h1 className="text-xl sm:text-2xl text-foreground font-bold flex items-center">
          <FiFileText className="mr-2" />
          Gestión de Licencias
        </h1>

        {/* Contenedor derecho - se apila en mobile */}
        <div className="flex flex-col xs:flex-row md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          
          {/* En mobile: primero los botones */}
          <div className="flex flex-row gap-3 order-1 md:order-none">
            <Link
              to="/request-license"
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-primary-hover transition duration-200 text-sm sm:text-base"
            >
              <FiPlus className="mr-2" />
              Solicitar Nueva
            </Link>

            {/* Botón Exportar */}
            {(user?.role === 'admin' || user?.role === 'supervisor') && (
              <button 
                onClick={handleExportClick}
                className="bg-primary text-white px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-primary-hover transition duration-200 text-sm sm:text-base"
                disabled={licenses.length === 0 || loading}
              >
                <FiDownload className="mr-2" />
                Exportar
              </button> 
            )}
          </div>
        </div>
      </div>

      {/* Mensaje de notificación */}
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ show: false, type: '', message: '' })}
        />
      )}
  
      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}
  
      {/* Barra de búsqueda y filtro */}
      <div className="bg-background rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-border flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:space-x-4">
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <div className="relative flex-grow flex flex-col sm:flex-row">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar empleado por nombre o apellido..."
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-md sm:rounded-l-md sm:rounded-r-none focus:outline-none text-foreground bg-background text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSearch}
                className="mt-2 sm:mt-0 px-4 py-2 border border-t-0 sm:border-t sm:border-l-0 border-border rounded-md sm:rounded-l-none sm:rounded-r-md bg-primary text-white hover:bg-primary-hover transition duration-200 cursor-pointer text-sm"
                disabled={loading}
              >
                Buscar
              </button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 text-foreground w-auto">
              <FiFilter className="text-gray-400" />
              <Select
                options={typeFilterOptions}
                value={typeFilterOptions.find(option => option.value === typeFilter)}
                onChange={(selectedOption) => {
                  setTypeFilter(selectedOption.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                styles={customStyles}
                isSearchable={false}
                className="w-full sm:w-48 text-sm"
                classNamePrefix="select"
                menuPlacement="auto"
                menuPosition="fixed"
                isLoading={loading || licenseTypes.length === 0}
                isDisabled={loading || licenseTypes.length === 0}
              />
            </div>
            <div className="flex items-center space-x-2 text-foreground w-auto">
              <FiFilter className="text-gray-400" />
              <Select
                options={statusFilterOptions}
                value={statusFilterOptions.find(option => option.value === filter)}
                onChange={(selectedOption) => {
                  setFilter(selectedOption.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                styles={customStyles}
                isSearchable={false}
                className="w-full sm:w-48 text-sm"
                classNamePrefix="select"
                menuPlacement="auto"
                menuPosition="fixed"
                isLoading={loading}
                isDisabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Vista de tabla para desktop y cards para mobile */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Vista de tabla - Solo visible en md y superiores */}
            <div className="hidden md:block overflow-x-auto">
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
                      <tr key={license.id} className='text-center hover:bg-card'>
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
                        {searchQuery || filter !== 'all' || typeFilter !== 'all' 
                          ? 'No se encontraron licencias que coincidan con los filtros'
                          : 'No hay licencias registradas'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Vista de cards - Solo visible en pantallas pequeñas */}
            <div className="md:hidden">
              {licenses.length > 0 ? (
                <div className="divide-y divide-border">
                  {licenses.map((license) => (
                    <div key={license.id} className="p-4 hover:bg-card transition-colors">
                      <div className="flex items-start space-x-3">
                        {/* Avatar con estado */}
                        <div 
                          className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                            getStatusColors(license.status).bg
                          } ${getStatusColors(license.status).text}`}
                        >
                          <FiFileText className="text-lg" />
                        </div>
                        
                        {/* Contenido principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                            <h3 className="text-sm font-semibold text-foreground truncate pr-2">
                              {license.employee}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 
                              ${getStatusColors(license.status).bg} ${getStatusColors(license.status).text}`}>
                              {translateStatus(license.status)}
                            </span>
                          </div>
                          
                          {/* Información de la licencia */}
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-foreground opacity-75">
                              <FiTag className="mr-2 flex-shrink-0" />
                              <span className="truncate capitalize">{license.type}</span>
                            </div>
                            <div className="flex items-center text-xs text-foreground opacity-75">
                              <FiCalendar className="mr-2 flex-shrink-0" />
                              <span className="truncate">{license.startDate} al {license.endDate}</span>
                            </div>
                            <div className="flex items-center text-xs text-foreground opacity-75">
                              <FiClock className="mr-2 flex-shrink-0" />
                              <span className="truncate">{license.days} días</span>
                            </div>
                          </div>
                          
                          {/* Acciones */}
                          <div className="flex justify-end space-x-3 mt-3">
                            <button
                              onClick={() => handleViewDetails(license.id)}
                              className="text-primary-text hover:text-primary-hover p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Ver detalle"
                            >
                              <FiEye className="text-base" />
                            </button>
                            
                            {canShowActions && (
                              <>
                                <Link
                                  to={`/edit-license/${license.id}`}
                                  className="text-primary-text hover:text-primary-hover p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                  <FiEdit className="text-base" />
                                </Link>

                                {user?.role === 'admin' && (
                                  <button 
                                    onClick={() => handleDelete(license.id)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Eliminar"
                                  >
                                    <FiTrash2 className="text-base" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-foreground">
                  {searchQuery || filter !== 'all' || typeFilter !== 'all' 
                    ? 'No se encontraron licencias que coincidan con los filtros'
                    : 'No hay licencias registradas'}
                </div>
              )}
            </div>
          </>
        )}
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
                className={`px-3 py-2 border-t border-b border-border text-sm font-medium transition-colors duration-200 ${
                  pagination.currentPage === i + 1
                    ? 'bg-special-light dark:bg-special-dark text-primary-text hover:bg-primary-hover/20 dark:hover:bg-primary-hover/30'
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
    </div>
  );
}

export default LicensesPage;