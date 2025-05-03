import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiCheck, FiX, FiEdit, FiTrash2, FiEye, FiUser, FiCalendar, FiFileText, FiPlus } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Confirmation from '../../components/common/Confirmation';
import { Link } from 'react-router-dom';
import { getLicenses } from '../../services/licenseService';

const LicensesPage = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState(null);
  const canShowActions = ['admin', 'supervisor'].includes(user?.role);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const response = await getLicenses();
        const formattedLicenses = response.licenses.map(license => ({
          id: license.license_id,
          employee: license.user.full_name,
          DNI: license.user.dni || 'No disponible',
          department: license.user.department || 'No disponible',
          type: license.type,
          startDate: license.start_date,
          endDate: license.end_date,
          days: license.days,
          status: license.status.toLowerCase(),
          requestedOn: license.created_at || '',
          information: license.information || '',
          documents: license.documents || null,
          email: license.user.email,
          phone: license.user.phone,
          dateOfBirth: license.user.date_of_birth
        }));
        
        setLicenses(formattedLicenses);
      } catch (error) {
        console.error('Error fetching licenses:', error);
      }
    };

    fetchLicenses();
  }, []);

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || license.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (id) => {
    setLicenses(licenses.map(license => 
      license.id === id ? {...license, status: 'approved'} : license
    ));
    setIsModalOpen(false);
    resetRejectionForm();
  };

  const handleReject = (id) => {
    if (!rejectionReason.trim()) {
      alert('Por favor ingrese un motivo de rechazo');
      return;
    }
    setLicenses(licenses.map(license => 
      license.id === id ? {...license, status: 'rejected', rejectionReason} : license
    ));
    setIsModalOpen(false);
    resetRejectionForm();
  };

  const handleEdit = (id) => {
    console.log('Editar licencia con ID:', id);
  };

  const handleDelete = (id) => {
    setLicenseToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleViewDetails = (license) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
    resetRejectionForm();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLicense(null);
    resetRejectionForm();
  };

  const resetRejectionForm = () => {
    setRejectionReason('');
    setShowRejectionInput(false);
  };

  return (
    <div className="p-6 relative">
      {/* Modal de Detalle */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10500"></div>
          
          <div className="fixed inset-0 flex items-center justify-center z-11000 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Detalle de Licencia</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="p-6">
                {selectedLicense && (
                  <div className="space-y-6">
                    {/* Sección de Acciones */}
                    {selectedLicense.status === 'pending' && canShowActions && (
                      <div className="flex flex-col space-y-3 pb-4 border-b border-gray-200">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApprove(selectedLicense.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center cursor-pointer"
                          >
                            <FiCheck className="mr-2" /> Aprobar
                          </button>
                          <button
                            onClick={() => setShowRejectionInput(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center cursor-pointer"
                          >
                            <FiX className="mr-2" /> Rechazar
                          </button>
                        </div>

                        {showRejectionInput && (
                          <div className="space-y-2">
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Ingrese el motivo del rechazo..."
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                              rows={3}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleReject(selectedLicense.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm cursor-pointer"
                              >
                                Confirmar Rechazo
                              </button>
                              <button
                                onClick={resetRejectionForm}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sección de Información del Empleado */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-3 flex items-center">
                        <FiUser className="mr-2" /> Información del Empleado
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nombre completo</p>
                          <p className="font-medium">{selectedLicense.employee}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">DNI</p>
                          <p className="font-medium">{selectedLicense.DNI}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Departamento/Área</p>
                          <p className="font-medium">{selectedLicense.department}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedLicense.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="font-medium">{selectedLicense.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                          <p className="font-medium">{selectedLicense.dateOfBirth}</p>
                        </div>
                      </div>
                    </div>

                    {/* Sección de Detalles de la Licencia */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-3 flex items-center">
                        <FiCalendar className="mr-2" /> Detalles de la Licencia
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Tipo de Licencia</p>
                          <p className="font-medium capitalize">{selectedLicense.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estado</p>
                          <div className="flex items-center">
                            {selectedLicense.status === 'approved' ? (
                              <FiCheck className="text-green-500 mr-1" />
                            ) : selectedLicense.status === 'rejected' ? (
                              <FiX className="text-red-500 mr-1" />
                            ) : null}
                            <span className={`font-medium ${
                              selectedLicense.status === 'approved' 
                                ? 'text-green-700' 
                                : selectedLicense.status === 'rejected' 
                                  ? 'text-red-700' 
                                  : 'text-yellow-600'
                            }`}>
                              {selectedLicense.status === 'approved' ? 'Aprobada' : 
                              selectedLicense.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Inicio</p>
                          <p className="font-medium">{selectedLicense.startDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Fin</p>
                          <p className="font-medium">{selectedLicense.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Días solicitados</p>
                          <p className="font-medium">{selectedLicense.days} día(s)</p>
                        </div>
                      </div>
                    </div>

                    {/* Sección de Motivo y Documentos */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Motivo</p>
                        <p className="font-medium whitespace-pre-line">{selectedLicense.information || 'No disponible'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Documentación adjunta</p>
                        {selectedLicense.documents ? (
                          <a 
                            href="#" 
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FiFileText className="mr-2" /> {selectedLicense.documents}
                          </a>
                        ) : (
                          <p className="text-gray-400">No hay documentos adjuntos</p>
                        )}
                      </div>

                      {selectedLicense.rejectionReason && (
                        <div className="bg-red-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Motivo de rechazo</p>
                          <p className="text-red-600 whitespace-pre-line">{selectedLicense.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
                      >
                        Cerrar
                      </button>
                      {(selectedLicense.status !== 'pending' || user.role === 'admin') && canShowActions && (
                        <Link
                          to={`/edit-license/${selectedLicense.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <FiEdit className="mr-2" /> Editar
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

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

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      onClick={() => handleViewDetails(license)}
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
          onConfirm={() => {
              setLicenses(licenses.filter(license => license.id !== licenseToDelete));
              setShowDeleteConfirmation(false);
              setLicenseToDelete(null);
          }}
          title="Eliminar Licencia"
          message="¿Estás seguro que deseas eliminar esta licencia? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
      />
    </div>
  );
};

export default LicensesPage;