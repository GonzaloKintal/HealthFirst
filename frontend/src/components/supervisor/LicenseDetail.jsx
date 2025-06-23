import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiEdit, FiEye, FiUser, FiCalendar, FiFileText, FiArrowLeft, FiPlus, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FormattedDate } from '../../components/utils/FormattedDate';
import Confirmation from '../../components/utils/Confirmation';
import { getLicenseDetail, evaluateLicense, analyzeCertificate } from '../../services/licenseService';
import useAuth from '../../hooks/useAuth';
import Notification from '../../components/utils/Notification';
import UploadCertificateModal from '../employee/UploadCertificateModal';
import LicenseDetailSkeleton from './LicenseDetailSkeleton';
import Select from 'react-select';
import { customStyles } from '../../components/utils/utils';

const LicenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOtherReasonInput, setShowOtherReasonInput] = useState(false);
  const [otherReason, setOtherReason] = useState('');

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        setLoading(true);

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
            otherRejectionReason: status === 'rejected' ? response.data.status?.other_evaluation_comment || '' : '',
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchLicense();
  }, [id]);

  const handleApprove = async () => {
  try {
    setIsProcessing(true);
    const response = await evaluateLicense(id, 'approved');
    
    if (response.success) {
      setNotification({
        show: true,
        type: 'success',
        message: 'Licencia aprobada correctamente'
      });
      
      // Volver a obtener los datos de la licencia desde el servidor
      const licenseResponse = await getLicenseDetail(id);
      
      if (licenseResponse.success && licenseResponse.data) {
        const status = licenseResponse.data.status?.name?.toLowerCase() || 'pending';
        const licenseData = {
          id: id,
          employee: licenseResponse.data.user?.full_name || 
                   `${licenseResponse.data.user?.first_name} ${licenseResponse.data.user?.last_name}`,
          DNI: licenseResponse.data.user?.dni || 'No disponible',
          department: licenseResponse.data.user?.department || 'No disponible',
          type: licenseResponse.data.license?.type || 'No disponible',
          startDate: licenseResponse.data.license?.start_date || '',
          endDate: licenseResponse.data.license?.end_date || '',
          days: licenseResponse.data.license?.required_days || 0,
          status: status,
          requestedOn: licenseResponse.data.license?.request_date || '',
          information: licenseResponse.data.license?.information || '',
          certificate: licenseResponse.data.certificate || null,
          email: licenseResponse.data.user?.email || '',
          phone: licenseResponse.data.user?.phone || '',
          dateOfBirth: licenseResponse.data.user?.date_of_birth || '',
          rejectionReason: status === 'rejected' ? licenseResponse.data.status?.evaluation_comment || '' : '',
          otherRejectionReason: status === 'rejected' ? response.data.status?.other_evaluation_comment || '' : '',
          evaluator: licenseResponse.data.license?.evaluator || '',
          evaluatorRole: licenseResponse.data.license?.evaluator_role || '',
          evaluationDate: licenseResponse.data.status?.evaluation_date || ''
        };
        setLicense(licenseData);
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: 'Licencia aprobada, pero no se pudieron actualizar los datos'
        });
      }
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
    setIsProcessing(false);
    setShowApproveConfirmation(false);
  }
};

const handleReject = async () => {
  try {
    setIsProcessing(true);

    // Determinar si es "Otro" o no
    const isOtherReason = rejectionReason === "Otro";
    const evaluationComment = isOtherReason ? "Otro" : rejectionReason;
    const otherEvaluationComment = isOtherReason ? otherReason : '';
    
    const response = await evaluateLicense(id, 'rejected', evaluationComment, otherEvaluationComment);
    
    if (response.success) {
      setNotification({
        show: true,
        type: 'success',
        message: 'Licencia rechazada correctamente'
      });
      
      // Volver a obtener los datos de la licencia desde el servidor
      const licenseResponse = await getLicenseDetail(id);
      
      if (licenseResponse.success && licenseResponse.data) {
        const status = licenseResponse.data.status?.name?.toLowerCase() || 'pending';
        const licenseData = {
          id: id,
          employee: licenseResponse.data.user?.full_name || 
                   `${licenseResponse.data.user?.first_name} ${licenseResponse.data.user?.last_name}`,
          DNI: licenseResponse.data.user?.dni || 'No disponible',
          department: licenseResponse.data.user?.department || 'No disponible',
          type: licenseResponse.data.license?.type || 'No disponible',
          startDate: licenseResponse.data.license?.start_date || '',
          endDate: licenseResponse.data.license?.end_date || '',
          days: licenseResponse.data.license?.required_days || 0,
          status: status,
          requestedOn: licenseResponse.data.license?.request_date || '',
          information: licenseResponse.data.license?.information || '',
          certificate: licenseResponse.data.certificate || null,
          email: licenseResponse.data.user?.email || '',
          phone: licenseResponse.data.user?.phone || '',
          dateOfBirth: licenseResponse.data.user?.date_of_birth || '',
          rejectionReason: status === 'rejected' ? licenseResponse.data.status?.evaluation_comment || '' : '',
          otherRejectionReason: status === 'rejected' ? response.data.status?.other_evaluation_comment || '' : '',
          evaluator: licenseResponse.data.license?.evaluator || '',
          evaluatorRole: licenseResponse.data.license?.evaluator_role || '',
          evaluationDate: licenseResponse.data.status?.evaluation_date || ''
        };
        setLicense(licenseData);
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: 'Licencia rechazada, pero no se pudieron actualizar los datos'
        });
      }
      
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
    setIsProcessing(false);
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
    setOtherReason('');
    setShowRejectionInput(false);
    setShowOtherReasonInput(false);
  };

  const handleAnalyzeCertificate = async () => {
    if (!license?.certificate?.file) {
      setNotification({
        show: true,
        type: 'error',
        message: 'No hay certificado disponible para analizar'
      });
      return;
    }
  
    try {
      setIsAnalyzing(true);
      const base64String = license.certificate.file.includes(',') 
        ? license.certificate.file.split(',')[1]
        : license.certificate.file;
      
      const [response] = await Promise.all([
        analyzeCertificate(base64String, id),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
      if (response.success) {
        setAnalysis(response.data);
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: response.error || 'Error al analizar el certificado'
        });
      }
    } catch (error) {
      console.error('Error analyzing certificate:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Error al analizar el certificado'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadSuccess = async (updatedData) => {
    try {
      // Refetch los datos de la licencia para asegurarnos de tener la última versión
      const response = await getLicenseDetail(id);
      
      if (response.success && response.data) {
        const status = response.data.status?.name?.toLowerCase() || 'pending';
        const updatedLicense = {
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
          otherRejectionReason: status === 'rejected' ? response.data.status?.other_evaluation_comment || '' : '',
          evaluator: response.data.license?.evaluator || '',
          evaluatorRole: response.data.license?.evaluator_role || '',
          evaluationDate: response.data.status?.evaluation_date || ''
        };
        
        setLicense(updatedLicense);
      }
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Certificado cargado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar los datos de la licencia:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Certificado cargado pero hubo un error al actualizar la vista'
      });
    }
  };

  const options = [
    { value: '', label: 'Seleccione un motivo de rechazo...' },
    { value: 'Certificado sin fechas', label: 'Certificado sin fechas' },
    { value: 'Certificado sin datos/vacío/ilegible', label: 'Certificado sin datos/vacío/ilegible' },
    { value: 'Certificado de enfermedad sin código o con datos faltantes', label: 'Certificado de enfermedad sin código o con datos faltantes' },
    { value: 'Certificado de enfermedad sin datos del profesional', label: 'Certificado de enfermedad sin datos del profesional' },
    { value: 'Certificado de enfermedad sin información de empleado', label: 'Certificado de enfermedad sin información de empleado' },
    { value: 'Certificado de enfermedad sin días de reposo', label: 'Certificado de enfermedad sin días de reposo' },
    { value: 'Certificado de estudios sin información de la institución', label: 'Certificado de estudios sin información de la institución' },
    { value: 'Certificado no acorde a la licencia solicitada', label: 'Certificado no acorde a la licencia solicitada' },
    { value: 'Certificado con datos sensibles', label: 'Certificado con datos sensibles' },
    { value: 'Otro', label: 'Otro' },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center text-primary-text cursor-pointer"
        >
          <FiArrowLeft className="mr-2 text-foreground" /> Volver atrás
        </button>
      </div>
    );
  }

  if (loading) {
    return <LicenseDetailSkeleton />
  }

  if (!license) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-text cursor-pointer"
        >
          <FiArrowLeft className="mr-2" /> Volver atrás
        </button>
      </div>

      <div className="bg-background rounded-lg shadow overflow-hidden">

        <div className="p-6 space-y-6">
          {/* Sección de Acciones */}
          {license.status === 'pending' && canShowActions && (
            <div className="flex flex-col space-y-3 pb-4 border-b border-border">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApproveConfirmation(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center cursor-pointer"
                  disabled={isProcessing}
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
                <Select
                  options={options}
                  value={options.find(option => option.value === rejectionReason) || null}
                  onChange={(selectedOption) => {
                    setRejectionReason(selectedOption.value);
                    setShowOtherReasonInput(selectedOption.value === 'Otro');
                  }}
                  styles={customStyles}
                  isSearchable={false}
                  className="w-full text-sm"
                  classNamePrefix="select"
                  menuPlacement="auto"
                  menuPosition="absolute"
                  placeholder="Seleccione un motivo de rechazo..."
                  required
                />

                {showOtherReasonInput && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Por favor especifique el motivo de rechazo..."
                    className="resize-none w-full mt-2 p-2 border bg-background border-border rounded-md focus:ring-primary-border focus:border-primary-border text-foreground text-sm"
                    rows={3}
                    required
                  />
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (rejectionReason === "Otro") {
                        if (!otherReason.trim()) {
                          setNotification({
                            show: true,
                            type: 'error',
                            message: 'Por favor especifique el motivo de rechazo'
                          });
                          return;
                        }
                      } else if (!rejectionReason.trim()) {
                        setNotification({
                          show: true,
                          type: 'error',
                          message: 'Por favor seleccione un motivo de rechazo'
                        });
                        return;
                      }
                      setShowRejectConfirmation(true);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm cursor-pointer"
                    disabled={isProcessing}
                  >
                    Confirmar Rechazo
                  </button>
                  <button
                    onClick={resetRejectionForm}
                    className="px-3 py-1 bg-border text-foreground rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            </div>
          )}

          {license.status === 'rejected' && license.rejectionReason && (
            <div className="bg-rejected p-3 rounded-md">
              <p className="text-sm text-foreground">Motivo de rechazo</p>
              <p className="text-rejected whitespace-pre-line">
                {license.rejectionReason === 'Otro' && license.otherRejectionReason 
                  ? `Otro: ${license.otherRejectionReason}`
                  : license.rejectionReason
                }
              </p>
            </div>
          )}
          
          {/* Sección de Información del Empleado */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-3 flex items-center text-foreground">
                <FiUser className="mr-2" /> Información del Empleado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground">Nombre completo</p>
                  <p className="font-medium text-foreground">{license.employee}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">DNI</p>
                  <p className="font-medium text-foreground">{license.DNI}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Departamento/Área</p>
                  <p className="font-medium text-foreground">{license.department}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Email</p>
                  <p className="font-medium text-foreground break-all">{license.email}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Teléfono</p>
                  <p className="font-medium text-foreground">{license.phone ? `+54 ${license.phone}` : 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">Fecha de Nacimiento</p>
                  <p className="font-medium text-foreground">
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
          <div className="bg-card p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3 flex items-center text-foreground">
              <FiCalendar className="mr-2" /> Detalles de la Licencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground">Tipo de Licencia</p>
                <p className="font-medium capitalize text-foreground">{license.type}</p>
              </div>
              <div>
                <p className="text-sm text-foreground">Estado</p>
                <div className="flex items-center">
                <span className={`font-medium ${
                  license.status === 'approved' 
                    ? 'text-green-700 dark:text-green-400' 
                    : license.status === 'rejected' 
                      ? 'text-red-500 dark:text-red-400'
                      : license.status === 'pending'
                        ? 'text-blue-600 dark:text-blue-400'
                        : license.status === 'missing_doc'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                }`}>
                  {license.status === 'approved' ? 'Aprobada' : 
                  license.status === 'rejected' ? 'Rechazada' : 
                  license.status === 'pending' ? 'Pendiente' :
                  license.status === 'missing_doc' ? 'Falta certificado' :
                  'Expirada'}
                  
                  {(license.status === 'approved' || license.status === 'rejected') && 
                    ['admin', 'supervisor'].includes(user?.role) && license.evaluator && license.evaluatorRole && (
                      <span className="text-foreground text-sm font-normal ml-2">
                        por el {license.evaluatorRole === 'admin' ? 'administrador' : license.evaluatorRole} {license.evaluator} el {FormattedDate({ dateString: license.evaluationDate }).date}
                      </span>
                  )}
                </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground">Fecha de Inicio</p>
                <p className="font-medium text-foreground">
                  {license.startDate ? FormattedDate({ dateString: license.startDate }).date : 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground">Fecha de Fin</p>
                <p className="font-medium text-foreground">
                  {license.endDate ? FormattedDate({ dateString: license.endDate }).date : 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground">Días solicitados</p>
                <p className="font-medium text-foreground">{license.days} día(s)</p>
              </div>
            </div>
          </div>

          {/* Sección de Justificación y Documentos */}
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="font-medium text-lg mb-3 flex items-center text-foreground">
              <FiFileText className="mr-2" /> Justificación
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground">Motivo</p>
                <p className="font-medium whitespace-pre-line text-foreground">{license.information || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground">Documentación adjunta</p>
                {license.certificate?.file ? (
                  <div className="bg-special-light dark:bg-special-dark p-3 rounded-md">
                    <h4 className="font-medium mb-2 text-foreground">Certificado</h4>
                    {license.certificate.upload_date && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-foreground">Cargado el:</p>
                          <p className="font-medium text-foreground">
                            {FormattedDate({ dateString: license.certificate.upload_date }).date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-foreground">A las:</p>
                          <p className="font-medium text-foreground">
                            {FormattedDate({ dateString: license.certificate.upload_date }).time}
                          </p>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={handleViewCertificate}
                      className="mt-2 inline-flex items-center text-primary-text cursor-pointer"
                    >
                      <FiEye className="mr-1" /> Ver certificado
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-foreground">No hay documentación adjunta</p>
                    {license.status === 'missing_doc' && (
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-2 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover cursor-pointer"
                      >
                        <FiPlus className="mr-2" />
                        Agregar certificado
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Análisis de Coherencia */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && license.certificate?.file && license.status === 'pending' && (
            <div className="bg-card p-4 rounded-lg shadow">
              <h3 className="font-medium text-lg mb-3 flex items-center text-foreground">
                <FiActivity className="mr-2" /> Coherencia
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleAnalyzeCertificate}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover flex items-center cursor-pointer disabled:bg-blue-500"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analizando...
                    </>
                  ) : (
                    <>
                      <FiActivity className="mr-2" />
                      Analizar coherencia
                    </>
                  )}
                </button>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 rounded">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong className="font-medium">Aviso:</strong> Los resultados son una recomendación predictiva generada por IA. 
                    La evaluación final y decisión corresponde al supervisor responsable.
                  </p>
                </div>

                {analysis && (
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="font-medium text-lg mb-3 text-foreground">Resultados del análisis</h4>
                    
                    <div className="space-y-4">
                      {/* Recomendación del modelo */}
                      <div className="flex items-center">
                        <span className="text-foreground font-medium">
                          Recomendación del modelo:{" "}
                          <span className={`font-semibold ${
                            parseFloat(analysis.probability_of_approval) > parseFloat(analysis.probability_of_rejection) 
                              ? 'text-green-600' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {parseFloat(analysis.probability_of_approval) > parseFloat(analysis.probability_of_rejection) 
                              ? 'Aprobar' 
                              : 'Rechazar'}
                          </span>
                        </span>
                      </div>

                      {license.type.toLowerCase() === 'enfermedad' && (
                        <div className={`p-3 rounded-md ${
                          analysis.has_code 
                            ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-400' 
                            : 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400'
                        }`}>
                          <div className="flex items-start gap-2">
                            {analysis.has_code 
                              ? <FiCheck className="flex-shrink-0 mt-0.5 text-green-600 dark:text-green-300" />
                              : <FiAlertTriangle className="flex-shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-300" />
                            }
                            <p className={`font-base text-sm ${
                              analysis.has_code 
                                ? 'text-green-800 dark:text-green-200' 
                                : 'text-yellow-800 dark:text-yellow-200'
                            }`}>
                              {analysis.has_code 
                                ? 'Este certificado de enfermedad incluye el código de unicidad válido.'
                                : 'Atención: Este certificado de enfermedad NO posee el código de unicidad.'}
                            </p>
                          </div>
                          {!analysis.has_code && (
                            <p className="text-sm mt-1 pl-6 text-yellow-800 dark:text-yellow-200">
                              Recomendamos al supervisor analizar con cuidado el certificado.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Probabilidades */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-background p-3 rounded-md">
                          <p className="text-sm text-foreground">Probabilidad de aprobación</p>
                          <p className="text-green-600 font-medium text-lg">
                            {analysis.probability_of_approval}
                          </p>
                        </div>
                        <div className="bg-background p-3 rounded-md">
                          <p className="text-sm text-foreground">Probabilidad de rechazo</p>
                          <p className="text-red-600 dark:text-red-400 font-medium text-lg">
                            {analysis.probability_of_rejection}
                          </p>
                        </div>
                      </div>

                      {/* Razones de rechazo (solo si la recomendación es rechazar) */}
                      {parseFloat(analysis.probability_of_approval) <= parseFloat(analysis.probability_of_rejection) && (
                        <div className="space-y-3">
                          <div className="bg-background p-3 rounded-md">
                            <p className="text-sm text-foreground">Motivo principal</p>
                            <p className="text-foreground font-medium capitalize">{analysis.reason_of_rejection}</p>
                          </div>
                          
                          <div className="bg-background p-3 rounded-md">
                            <p className="text-sm text-foreground mb-2">Razones detectadas</p>
                            <div className="space-y-2">
                              {analysis.top_reasons.map((reason, index) => (
                                <div key={index} className="flex items-start">
                                  <span className="text-foreground mr-2">•</span>
                                  <span className="text-foreground capitalize">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tipos de licencia */}
                      <div className="bg-background p-3 rounded-md">
                        <p className="text-sm text-foreground mb-2">Tipos de licencia detectados</p>
                        <div className="border border-border rounded overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                              <tr>
                                <th className="py-2 px-3 text-left text-sm font-medium text-foreground">Tipo</th>
                                <th className="py-2 px-3 text-right text-sm font-medium text-foreground">Probabilidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analysis.license_types.map(([type, probability], index) => (
                                <tr 
                                  key={index} 
                                  className={`${
                                    index % 2 === 0 ? 'bg-background' : 'bg-gray-50 dark:bg-gray-800'
                                  }`}
                                >
                                  <td className="py-2 px-3 text-foreground capitalize">{type.replace(/_/g, ' ')}</td>
                                  <td className="py-2 px-3 text-foreground text-right">{probability}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-card text-foreground rounded-md hover:bg-border cursor-pointer"
            >
              Volver
            </button>
            {(user?.role === 'admin' || (user?.role === 'supervisor' && license.status === 'pending')) && (
              <Link
                to={`/edit-license/${license.id}`}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover flex items-center"
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
        confirmDisabled={isProcessing}
      />

      <Confirmation
        isOpen={showRejectConfirmation}
        onClose={() => setShowRejectConfirmation(false)}
        onConfirm={handleReject}
        title="Rechazar Licencia"
        message={`¿Estás seguro que deseas rechazar esta licencia con el siguiente motivo?\n\n"${
          rejectionReason === "Otro" ? otherReason : rejectionReason
        }"`}
        confirmText="Confirmar Rechazo"
        cancelText="Cancelar"
        type="danger"
        confirmDisabled={isProcessing}
      />

      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ show: false, type: '', message: '' })}
        />
      )}

      {showUploadModal && (
        <UploadCertificateModal
          licenseId={license.id}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default LicenseDetail;