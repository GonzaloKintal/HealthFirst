

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiDownload, FiEdit, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Confirmation from '../../components/utils/Confirmation';
import { Link } from 'react-router-dom';
import { getLicenses, deleteLicense } from '../../services/licenseService';
import Notification from '../../components/utils/Notification';

const LicensesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState(null);
  const canShowActions = ['admin', 'supervisor'].includes(user?.role);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const shouldShowAll = ['admin', 'supervisor'].includes(user?.role);
        
        const response = await getLicenses({ 
          user_id: user?.id,
          show_all_users: shouldShowAll
        });
        
        if (response.success) {
          const formattedLicenses = response.licenses.map(license => ({
            id: license.license_id,
            employee: license.user.first_name + ' ' + license.user.last_name,
            type: license.type,
            startDate: license.start_date,
            endDate: license.end_date,
            days: license.days,
            status: license.status,
            requestedOn: license.created_at || '',
          }));
          setLicenses(formattedLicenses);
        } else {
          console.error('Error fetching licenses:', response.error);
          setLicenses([]);
          setError('No se pudieron cargar las licencias. Por favor intenta nuevamente.');
        }
      } catch (error) {
        console.error('Error fetching licenses:', error);
        setLicenses([]);
        setError('No se pudieron cargar las licencias. Por favor intenta nuevamente.');
      }
    };
  
    if (user?.id) {
      fetchLicenses();
    }
  }, [user]);

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || license.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id) => {
    setLicenseToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      const previousLicenses = [...licenses];
      
      // Actualización optimista
      setLicenses(previousLicenses.filter(license => license.id !== licenseToDelete));
      
      await deleteLicense(licenseToDelete);
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Licencia eliminada con éxito.'
      });
      
    } catch (error) {
      console.error('Error al eliminar licencia:', error);
      setLicenses(previousLicenses);
      setNotification({
        show: true,
        type: 'error',
        message: 'No se pudo eliminar la licencia. Por favor intenta nuevamente.'
      });
    } finally {
      setShowDeleteConfirmation(false);
      setLicenseToDelete(null);
      
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    }
  };

  const handleViewDetails = (licenseId) => {
    navigate(`/license-detail/${licenseId}`);
  };

  return (
    <div className="p-6 relative">
      {/* Contenido principal */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Licencias</h1>
        <div className="flex space-x-3">
          <Link
            to="/request-license"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Solicitar Nueva
          </Link>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md cursor-pointer hover:bg-blue-700 transition duration-200">
            <FiDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
                {canShowActions && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLicenses.map((license) => (
                <tr key={license.id} className='text-center'>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{license.employee}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{license.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {license.startDate} al {license.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.days}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      license.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : license.status === 'rejected' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {license.status === 'approved' ? 'Aprobada' : 
                       license.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(license.id)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer flex items-center mx-auto"
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
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer"
                        >
                          <FiEdit size={18} />
                        </Link>

                        <button 
                          onClick={() => handleDelete(license.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLicenses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron licencias que coincidan con los filtros
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

      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ show: false, type: '', message: '' })}
        />
      )}
    </div>
  );
};

export default LicensesPage;