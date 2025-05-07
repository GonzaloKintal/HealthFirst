import { useState, useEffect } from 'react';
import { FiCalendar, FiUpload, FiUser, FiFileText, FiSave, FiX } from 'react-icons/fi';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Notification from '../utils/Notification';
import { getLicenseDetail,
  // updateLicense,
  getLicenseTypes } from '../../services/licenseService';

const EditLicense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    licenseTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    documents: null,
    declaration: false
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [notification, setNotification] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applicantData, setApplicantData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    department: '',
    phone: ''
  });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Cargar tipos de licencia
  useEffect(() => {
    const fetchLicenseTypes = async () => {
      try {
        const response = await getLicenseTypes();
        if (response.success) {
          setLicenseTypes(response.data.types);
        } else {
          setNotification({
            type: 'error',
            message: 'Error al cargar los tipos de licencia disponibles'
          });
        }
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'Error al cargar los tipos de licencia'
        });
      }
    };
    
    fetchLicenseTypes();
  }, []);

  // Cargar datos de la licencia a editar
  useEffect(() => {
    const fetchLicenseData = async () => {
      setIsLoading(true);
      try {
        const response = await getLicenseDetail(id);
        if (response.success) {
          const { license, user, certificate } = response.data;
          
          // Establecer datos del solicitante (no editables)
          setApplicantData({
            firstName: user.first_name,
            lastName: user.last_name,
            dni: user.dni,
            department: user.department,
            phone: user.phone
          });

          // Establecer datos editables de la licencia
          setFormData(prev => ({
            ...prev,
            licenseType: license.type, // Usamos el nombre del tipo directamente
            startDate: license.start_date,
            endDate: license.end_date,
            reason: license.information,
            documents: null,
            declaration: true
          }));

          // Usar los días calculados del backend
          setCalculatedDays(license.required_days);

          // Establecer documento existente si hay uno
          if (certificate) {
            setExistingDocument(certificate.file_name || 'documento_adjunto.pdf');
          }
        } else {
          setNotification({
            type: 'error',
            message: response.error || 'Error al cargar los datos de la licencia'
          });
        }
      } catch (error) {
        console.error('Error fetching license details:', error);
        setNotification({
          type: 'error',
          message: 'Error al cargar los datos de la licencia'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicenseData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : (files ? files[0] : value)
      };
      
      if (name === 'startDate' || name === 'endDate') {
        if (newData.startDate && newData.endDate) {
          const start = new Date(newData.startDate);
          const end = new Date(newData.endDate);
          
          if (end < start) {
            setNotification({
              type: 'error',
              message: 'La fecha de fin no puede ser anterior a la fecha de inicio.'
            });
            return prev;
          }
          
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setCalculatedDays(diffDays);
        } else {
          setCalculatedDays(0);
        }
      }
      
      return newData;
    });
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.declaration) {
      setNotification({
        type: 'error',
        message: 'Debe aceptar la declaración para enviar la solicitud.'
      });
      return;
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        setNotification({
          type: 'error',
          message: 'La fecha de fin no puede ser anterior a la fecha de inicio.'
        });
        return;
      }
    }
    
    try {
      // Preparar los datos para actualizar
      const certificate = formData.documents 
        ? {
            validation: true,
            file: await readFileAsBase64(formData.documents),
            file_name: formData.documents.name
          }
        : existingDocument
          ? {
              validation: true,
              file: "",
              file_name: existingDocument
            }
          : {
              validation: false,
              file: "",
              file_name: ""
            };

      const licenseData = {
        type_id: Number(formData.licenseTypeId),
        start_date: formData.startDate,
        end_date: formData.endDate,
        information: formData.reason,
        certificate
      };

      console.log('Datos de la licencia a actualizar:', licenseData);
      // DESCOMENTAR ESTO
      // Enviar la actualización
      // const response = await updateLicense(id, licenseData);
      
      // if (response.success) {
      //   setNotification({
      //     type: 'success',
      //     message: 'La licencia ha sido actualizada correctamente.'
      //   });
        
      //   // Redirigir después de 3 segundos
      //   setTimeout(() => {
      //     navigate(-1); // Volver a la página anterior
      //   }, 3000);
      // } else {
      //   throw new Error(response.error || 'Error al actualizar la licencia');
      // }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 
               'Ocurrió un error al actualizar la licencia.'
      });
    }
  };

  const handleRemoveDocument = () => {
    setFormData(prev => ({ ...prev, documents: null }));
    setExistingDocument(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto relative">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Licencia</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Datos Personales (solo lectura) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUser className="mr-2" /> Datos del Solicitante
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={applicantData.firstName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={applicantData.lastName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <input
                type="text"
                value={applicantData.dni}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento/Área</label>
              <input
                type="text"
                value={applicantData.department}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={applicantData.phone}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Sección de Detalles de la Licencia (editable) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiCalendar className="mr-2" /> Detalles de la Licencia
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Licencia *</label>
              <select
                name="licenseTypeId"
                value={formData.licenseTypeId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar tipo</option>
                {licenseTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días Solicitados</label>
              <input
                type="text"
                value={calculatedDays > 0 ? `${calculatedDays} día(s)` : 'Se calculará automáticamente'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describa el motivo de la licencia..."
            />
          </div>
        </div>

        {/* Sección de Documentación (editable) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUpload className="mr-2" /> Documentación Adjunta
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjuntar Documento (opcional)
            </label>
            
            {existingDocument && !formData.documents && (
              <div className="mb-3 p-3 bg-gray-50 rounded-md flex justify-between items-center">
                <div className="flex items-center">
                  <FiFileText className="text-gray-500 mr-2" />
                  <span className="text-sm">{existingDocument}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveDocument}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiX size={18} />
                </button>
              </div>
            )}
            
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FiFileText className="inline mr-2 text-lg" />
                {formData.documents || existingDocument ? 'Cambiar archivo' : 'Seleccionar archivo'}
                <input
                  type="file"
                  name="documents"
                  onChange={handleChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
              <span className="ml-2 text-sm text-gray-500">
                {formData.documents ? formData.documents.name : 
                 existingDocument ? 'Documento existente' : 'Ningún archivo seleccionado'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Formatos aceptados: PDF, JPG, PNG (Máx. 10MB)
            </p>
          </div>

          {/* Declaración y Confirmación */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Declaración y Confirmación</h3>
            <p className="text-sm mb-3">
              "Declaro que la información proporcionada es correcta y entiendo que la aprobación de esta licencia está sujeta a las políticas de la empresa."
            </p>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="declaration"
                checked={formData.declaration}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <span className="ml-2 text-sm text-gray-700">Acepto la declaración</span>
            </label>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <Link
            to={-1}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
          >
            <FiSave className="mr-2" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLicense;