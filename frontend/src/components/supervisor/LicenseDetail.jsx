import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiEdit, FiTrash2, FiEye, FiUser, FiCalendar, FiFileText, FiArrowLeft, FiClock } from 'react-icons/fi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FormattedDate } from '../../components/utils/FormattedDate';
import Confirmation from '../../components/utils/Confirmation';
import { getLicenseDetail } from '../../services/licenseService';
import useAuth from '../../hooks/useAuth';
import Notification from '../../components/utils/Notification';
import { evaluateLicense } from '../../services/licenseService';

const LicenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [license, setLicense] = useState(null);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [showApproveConfirmation, setShowApproveConfirmation] = useState(false);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);

  const canShowActions = ['admin', 'supervisor'].includes(user?.role);

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        const response = await getLicenseDetail(id);
  
        if (response.success && response.data) {
          const status = response.data.status?.name?.toLowerCase() || 'pending';
          const licenseData = {
            id: id,
            employee: response.data.user?.full_name || 
                     `${response.data.user?.first_name} ${response.data.user?.last_name}`,
            DNI: response.data.user?.dni || 'No disponible',
            department: response.data.user?.department || 'No disponible',
            type: response.data.license?.type || 'No disponible',
            startDate: response.data.license?.start_date || '',
            endDate: response.data.license?.end_date || '',
            days: response.data.license?.required_days || 0,
            status: status,
            requestedOn: response.data.license?.request_date || '',
            information: response.data.license?.information || '',
            certificate: response.data.certificate || null,
            email: response.data.user?.email || '',
            phone: response.data.user?.phone || '',
            dateOfBirth: response.data.user?.date_of_birth || '',
            rejectionReason: status === 'rejected' ? response.data.status?.evaluation_comment || '' : '',
            evaluator: response.data.license?.evaluator || '',
            evaluatorRole: response.data.license?.evaluator_role || '',
            evaluationDate: response.data.status?.evaluation_date || ''
          };
          setLicense(licenseData);
        } else {
          setError(response.error || 'No se pudo cargar la licencia. Por favor intenta nuevamente.');
        }
      } catch (error) {
        console.error('Error fetching license:', error);
        setError('No se pudo cargar la licencia. Por favor intenta nuevamente.');
      }
    };
    
    fetchLicense();
  }, [id]);


  const handleApprove = async () => {
    try {
      const response = await evaluateLicense(id, 'approved');
      
      if (response.success) {
        setNotification({
          show: true,
          type: 'success',
          message: 'Licencia aprobada correctamente'
        });
        setLicense(prev => ({ 
          ...prev, 
          status: 'approved',
          evaluator: `${user.first_name} ${user.last_name}`,
          evaluatorRole: user.role,
          evaluationDate: new Date().toISOString().split('T')[0]
        }));
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: response.error || 'Error al aprobar la licencia'
        });
      }
    } catch (error) {
      console.error('Error approving license:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Error al aprobar la licencia'
      });
    } finally {
      setShowApproveConfirmation(false);
    }
  };
  
  const handleReject = async () => {
    try {
      const response = await evaluateLicense(id, 'rejected', rejectionReason);
      
      if (response.success) {
        setNotification({
          show: true,
          type: 'success',
          message: 'Licencia rechazada correctamente'
        });
        setLicense(prev => ({
          ...prev,
          status: 'rejected',
          rejectionReason: rejectionReason,
          evaluator: `${user.first_name} ${user.last_name}`,
          evaluatorRole: user.role,
          evaluationDate: new Date().toISOString().split('T')[0]
        }));
        resetRejectionForm();
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: response.error || 'Error al rechazar la licencia'
        });
      }
    } catch (error) {
      console.error('Error rejecting license:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Error al rechazar la licencia'
      });
    } finally {
      setShowRejectConfirmation(false);
    }
  };

  const handleViewCertificate = () => {
    try {
      if (!license?.certificate?.file) {
        setNotification({
          show: true,
          type: 'error',
          message: 'No hay certificado disponible'
        });
        return;
      }
  
      const base64Data = license.certificate.file.includes(',') 
        ? license.certificate.file.split(',')[1]
        : license.certificate.file;
  
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'application/pdf'});
      
      const pdfUrl = URL.createObjectURL(blob);
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = `certificado-${license.id}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
  
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
    } catch (error) {
      console.error('Error al visualizar el certificado:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'No se pudo abrir el certificado'
      });
    }
  };

  const resetRejectionForm = () => {
    setRejectionReason('');
    setShowRejectionInput(false);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          <FiArrowLeft className="mr-2" /> Volver atrás
        </button>
      </div>
    );
  }

  if (!license) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          <FiArrowLeft className="mr-2" /> Volver atrás
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Sección de Acciones */}
          {license.status === 'pending' && canShowActions && (
            <div className="flex flex-col space-y-3 pb-4 border-b border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApproveConfirmation(true)}
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
                  required
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (!rejectionReason.trim()) {
                        setNotification({
                          show: true,
                          type: 'error',
                          message: 'Por favor ingrese un motivo de rechazo'
                        });
                        return;
                      }
                      setShowRejectConfirmation(true);
                    }}
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
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-3 flex items-center">
                <FiUser className="mr-2" /> Información del Empleado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">{license.employee}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DNI</p>
                  <p className="font-medium">{license.DNI}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Departamento/Área</p>
                  <p className="font-medium">{license.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{license.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{license.phone ? `+54 ${license.phone}` : 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {license.dateOfBirth 
                      ? new Date(license.dateOfBirth).toLocaleDateString('es-AR', { 
                          timeZone: 'UTC',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : 'No disponible'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Detalles de la Licencia */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3 flex items-center">
              <FiCalendar className="mr-2" /> Detalles de la Licencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Licencia</p>
                <p className="font-medium capitalize">{license.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <div className="flex items-center">
                  {/* {license.status === 'approved' ? (
                    <FiCheck className="text-green-500 mr-1" />
                  ) : license.status === 'rejected' ? (
                    <FiX className="text-red-500 mr-1" />
                  ) : (
                    <FiClock className="text-yellow-600 mr-1" />
                  )} */}
                  <span className={`font-medium ${
                    license.status === 'approved' 
                      ? 'text-green-700' 
                      : license.status === 'rejected' 
                        ? 'text-red-700' 
                        : 'text-yellow-600'
                  }`}>
                    {license.status === 'approved' ? 'Aprobada' : 
                    license.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                    {(license.status === 'approved' || license.status === 'rejected') && 
                    ['admin', 'supervisor'].includes(user?.role) && (
                      <span className="text-gray-600 text-sm font-normal ml-2">
                        por el {license.evaluatorRole === 'admin' ? 'administrador' : license.evaluatorRole} {license.evaluator} el {FormattedDate({ dateString: license.evaluationDate }).date}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Fecha de Inicio</p>
                <p className="font-medium">
                  {license.startDate ? FormattedDate({ dateString: license.startDate }).date : 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Fin</p>
                <p className="font-medium">
                  {license.endDate ? FormattedDate({ dateString: license.endDate }).date : 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Días solicitados</p>
                <p className="font-medium">{license.days} día(s)</p>
              </div>
            </div>
          </div>

          {/* Sección de Justificación y Documentos */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="font-medium text-lg mb-3 flex items-center">
              <FiFileText className="mr-2" /> Justificación
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Motivo</p>
                <p className="font-medium whitespace-pre-line">{license.information || 'No disponible'}</p>
              </div>

              {/* Documentación adjunta */}
              <div>
                <p className="text-sm text-gray-500">Documentación adjunta</p>
                {license.certificate?.file ? (
                  <div className="bg-blue-100 p-3 rounded-md">
                    <h4 className="font-medium mb-2">Certificado</h4>
                    {license.certificate.upload_date && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-gray-500">Cargado el:</p>
                          <p className="font-medium">
                            {FormattedDate({ dateString: license.certificate.upload_date }).date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-gray-500">A las:</p>
                          <p className="font-medium">
                            {FormattedDate({ dateString: license.certificate.upload_date }).time}
                          </p>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={handleViewCertificate}
                      className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <FiEye className="mr-1" /> Ver certificado
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400">No hay documentación adjunta</p>
                )}
              </div>

              {license.status === 'rejected' && license.rejectionReason && (
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Motivo de rechazo</p>
                  <p className="text-red-600 whitespace-pre-line">{license.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
            >
              Volver
            </button>
            {(user?.role === 'admin' || (user?.role === 'supervisor' && license.status === 'pending')) && (
              <Link
                to={`/edit-license/${license.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <FiEdit className="mr-2" /> Editar
              </Link>
            )}
          </div>
        </div>
      </div>

      <Confirmation
        isOpen={showApproveConfirmation}
        onClose={() => setShowApproveConfirmation(false)}
        onConfirm={handleApprove}
        title="Aprobar Licencia"
        message="¿Estás seguro que deseas aprobar esta licencia?"
        confirmText="Aprobar"
        cancelText="Cancelar"
        type="info"
      />

      <Confirmation
        isOpen={showRejectConfirmation}
        onClose={() => setShowRejectConfirmation(false)}
        onConfirm={handleReject}
        title="Rechazar Licencia"
        message={`¿Estás seguro que deseas rechazar esta licencia con el siguiente motivo?\n\n"${rejectionReason}"`}
        confirmText="Confirmar Rechazo"
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

export default LicenseDetail;