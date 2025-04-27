
import { useState, useEffect } from 'react';
import { FiClock, FiCheck, FiX, FiPlus, FiEye, FiEdit } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const MyLicensesPage = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Datos de ejemplo - reemplazar con llamada API real
  useEffect(() => {
    const mockLicenses = [
      {
        id: 1,
        type: 'Vacaciones',
        startDate: '2023-07-10',
        endDate: '2023-07-20',
        days: 10,
        status: 'approved',
        requestedOn: '2023-06-25',
        approvedBy: 'María Gómez (Supervisora)',
        reason: 'Vacaciones programadas con anticipación según calendario anual',
        documents: 'planificacion_vacaciones.pdf'
      },
      {
        id: 2,
        type: 'Enfermedad',
        startDate: '2023-08-05',
        endDate: '2023-08-07',
        days: 2,
        status: 'approved',
        requestedOn: '2023-08-01',
        approvedBy: 'María Gómez (Supervisora)',
        reason: 'Cuadro gripal con fiebre alta confirmado por médico',
        documents: 'certificado_medico.pdf'
      },
      {
        id: 3,
        type: 'Asuntos personales',
        startDate: '2023-09-15',
        endDate: '2023-09-15',
        days: 1,
        status: 'pending',
        requestedOn: '2023-09-10',
        reason: 'Trámite bancario que no puede realizarse fuera de horario laboral'
      },
      {
        id: 4,
        type: 'Doctor',
        startDate: '2023-06-18',
        endDate: '2023-06-18',
        days: 1,
        status: 'rejected',
        requestedOn: '2023-06-15',
        rejectedBy: 'María Gómez (Supervisora)',
        rejectionReason: 'Falta de documentación médica que respalde la solicitud',
        reason: 'Consulta médica de control rutinario'
      }
    ];

    setLicenses(mockLicenses);
    setLoading(false);
  }, []);

  const getStatusBadge = (status) => {
    const statusClasses = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const statusText = {
      approved: 'Aprobada',
      pending: 'Pendiente',
      rejected: 'Rechazada'
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  const handleViewDetails = (license) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLicense(null);
  };

  const handleEditRequest = (licenseId) => {
    navigate(`/edit-license/${licenseId}`);
    closeModal();
  };

  return (
    <div className="p-6">
      {/* Modal de Detalle */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10500"></div>
          
          <div className="fixed inset-0 flex items-center justify-center z-11000 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Detalle de Mi Licencia</h2>
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
                    {/* Sección de Detalles de la Licencia */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-3 flex items-center">
                        <FiClock className="mr-2" /> Detalles de la Licencia
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
                            ) : (
                              <FiClock className="text-yellow-500 mr-1" />
                            )}
                            <span className={`font-medium ${
                              selectedLicense.status === 'approved' 
                                ? 'text-green-700' 
                                : selectedLicense.status === 'rejected' 
                                  ? 'text-red-700' 
                                  : 'text-yellow-700'
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
                          <p className="font-medium">{selectedLicense.days} día{selectedLicense.days !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de solicitud</p>
                          <p className="font-medium">{selectedLicense.requestedOn}</p>
                        </div>
                      </div>
                    </div>

                    {/* Sección de Información Adicional */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Motivo</p>
                        <p className="font-medium whitespace-pre-line">{selectedLicense.reason}</p>
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
                            <FiEye className="mr-2" /> {selectedLicense.documents}
                          </a>
                        ) : (
                          <p className="text-gray-400">No hay documentos adjuntos</p>
                        )}
                      </div>

                      {selectedLicense.status === 'approved' && (
                        <div className="bg-green-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Aprobado por</p>
                          <p className="text-green-700">{selectedLicense.approvedBy}</p>
                        </div>
                      )}

                      {selectedLicense.status === 'rejected' && (
                        <div className="bg-red-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Rechazado por</p>
                          <p className="text-red-700">{selectedLicense.rejectedBy}</p>
                          <p className="text-sm text-gray-500 mt-1">Motivo de rechazo</p>
                          <p className="text-red-600 whitespace-pre-line">{selectedLicense.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      {selectedLicense.status === 'pending' && (
                        <button
                          onClick={() => handleEditRequest(selectedLicense.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
                        >
                          <FiEdit className="mr-2" />
                          Modificar solicitud
                        </button>
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
        <h1 className="text-2xl font-bold">Mis Licencias</h1>
        <Link
          to="/request-license"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Solicitar Nueva
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map((license) => (
              <tr key={license.id} className='text-center'>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                  {license.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.startDate} {license.startDate !== license.endDate && `al ${license.endDate}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {license.days} día{license.days !== 1 ? 's' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(license.status)}
                  {license.rejectionReason && (
                    <div className="text-xs text-red-500 mt-1 line-clamp-1">{license.rejectionReason}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(license)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer flex items-center mx-auto"
                    title="Ver detalle"
                  >
                    <FiEye className="mr-1" />
                    <span>Detalle</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {licenses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes licencias registradas</p>
          <Link
            to="/request-license"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Solicitar tu primera licencia
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyLicensesPage;