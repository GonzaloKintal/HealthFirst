import { useState, useEffect } from 'react';
import { FiCalendar, FiUpload, FiUser, FiFileText, FiSave } from 'react-icons/fi';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Notification from '../utils/Notification';
import { getLicenseDetail,
  updateLicense,
  getLicenseTypes } from '../../services/licenseService';
import FileValidator from '../utils/FileValidator';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import StyledDatePicker from '../utils/StyledDatePicker';

const EditLicense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    licenseTypeId: '',
    startDate: null,
    endDate: null,
    information: '',
    documents: null,
    declaration: false,
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
      // Espera a que los tipos de licencia estén cargados
      if (licenseTypes.length === 0) return;
      
      const response = await getLicenseDetail(id);
      if (response.success) {
        const { license, user, certificate } = response.data;
        
        setApplicantData({
          firstName: user.first_name,
          lastName: user.last_name,
          dni: user.dni,
          department: user.department,
          phone: user.phone
        });

        // Encuentra el tipo de licencia correspondiente
        const licenseType = licenseTypes.find(t => t.name === license.type);
        
        setFormData(prev => ({
          ...prev,
          licenseTypeId: licenseType?.id || '',
          startDate: license.start_date ? new Date(new Date(license.start_date).getTime() + (new Date(license.start_date).getTimezoneOffset() * 60000)) : null,
          endDate: license.end_date ? new Date(new Date(license.end_date).getTime() + (new Date(license.end_date).getTimezoneOffset() * 60000)) : null,
          information: license.information,
          documents: null,
          declaration: true
        }));

        setCalculatedDays(license.required_days);

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
  }, [id, licenseTypes]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (files ? files[0] : value)
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: date
      };
      
      // Calcular días si ambas fechas están presentes
      if (field === 'startDate' && date && newData.endDate) {
        const end = new Date(newData.endDate);
        const diffTime = Math.abs(end - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diffDays);
      } else if (field === 'endDate' && date && newData.startDate) {
        const start = new Date(newData.startDate);
        const diffTime = Math.abs(date - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diffDays);
      } else if (!date) {
        setCalculatedDays(0);
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

  const safeFormatDate = (date) => {
    if (!date) return null;
    try {
      // Asegurarse de que la fecha se maneje correctamente en la zona horaria local
      const adjustedDate = new Date(date);
      adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset());
      return format(adjustedDate, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validar declaración
      if (!formData.declaration) {
        setNotification({
          type: 'error',
          message: 'Debe aceptar la declaración para continuar.'
        });
        return;
      }
  
      // Validar fechas
      if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
        setNotification({
          type: 'error',
          message: 'La fecha de fin no puede ser anterior a la fecha de inicio.'
        });
        return;
      }

      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };
  
      // Preparar datos para enviar al backend
      const requestData = {
        type_id: formData.licenseTypeId,
        start_date: safeFormatDate(formData.startDate),
        end_date: safeFormatDate(formData.endDate),
        information: formData.information
      };
  
      // Solo manejar nuevo documento
      if (formData.documents) {
        const base64File = await readFileAsBase64(formData.documents);
        requestData.certificate = {
          file: base64File,
          validation: false
        };
      }
  
      const response = await updateLicense(id, requestData);
  
      if (response.success) {
        setNotification({
          type: 'success',
          message: 'Licencia actualizada exitosamente.'
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate(-1); // O a la ruta que prefieras
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: response.error || 'Error al actualizar la licencia.'
        });
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setNotification({
        type: 'error',
        message: 'Ocurrió un error inesperado al procesar la solicitud.'
      });
    }
  };

  const handleRemoveDocument = () => {
    setFormData(prev => ({ ...prev, documents: null }));
    setExistingDocument(null);
  };

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
        <h1 className="text-2xl font-bold text-foreground">Editar Licencia</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete='off'>
        {/* Sección de Datos Personales (solo lectura) */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
            <FiUser className="mr-2" /> Datos del Solicitante
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
              <input
                type="text"
                value={applicantData.firstName}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Apellido</label>
              <input
                type="text"
                value={applicantData.lastName}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">DNI</label>
              <input
                type="text"
                value={applicantData.dni}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Departamento/Área</label>
              <input
                type="text"
                value={applicantData.department}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
              <input
                type="text"
                value={applicantData.phone}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
              />
            </div>
          </div>
        </div>

        {/* Sección de Detalles de la Licencia (editable) */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
            <FiCalendar className="mr-2" /> Detalles de la Licencia
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tipo de Licencia *</label>
              <select
                name="licenseTypeId"
                value={formData.licenseTypeId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border text-foreground bg-background"
              >
                <option value="">Seleccionar tipo</option>
                {licenseTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Días Solicitados</label>
              <input
                type="text"
                value={calculatedDays > 0 ? `${calculatedDays} día(s)` : 'Se calculará automáticamente'}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Inicio *</label>
              <StyledDatePicker
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                selectsStart
                startDate={formData.startDate}
                endDate={formData.endDate}
                minDate={new Date()}
                required
                locale={es}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccione fecha de inicio"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Fin *</label>
              <StyledDatePicker
                selected={formData.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                selectsEnd
                startDate={formData.startDate}
                endDate={formData.endDate}
                minDate={formData.startDate || new Date()}
                required
                locale={es}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccione fecha de fin"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1">Motivo *</label>
            <textarea
              name="information"
              value={formData.information}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border resize-none text-foreground bg-background"
              placeholder="Describa el motivo de la licencia..."
            />
          </div>
        </div>

        {/* Sección de Documentación (editable) */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
            <FiUpload className="mr-2" /> Documentación Adjunta
          </h2>
          
          <FileValidator onValidation={(result) => {
            if (!result.isValid) {
              setNotification({ type: 'error', message: result.error });
            }
          }}>
            {({ validateFile, error }) => (
              <div>
                <label className="block text-sm font-medium text-foreground bg-background mb-1">
                  Adjuntar Documento (opcional)
                </label>
                
                {existingDocument && !formData.documents && (
                  <div className="mb-3 p-3 bg-background rounded-md flex items-center text-foreground">
                    <FiFileText className="text-foreground mr-2" />
                    <span className="text-sm">{existingDocument}</span>
                  </div>
                )}
                
                <div className="mt-1 flex items-center">
                  <label className="cursor-pointer bg-background py-2 px-3 border border-border rounded-md shadow-sm text-sm leading-4 font-medium text-foreground hover:bg-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-border">
                    <FiFileText className="inline mr-2 text-lg" />
                    {(formData.documents || existingDocument) ? 'Reemplazar archivo' : 'Seleccionar archivo'}
                    <input
                      type="file"
                      name="documents"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (validateFile(file)) {
                          handleChange(e);
                        } else {
                          e.target.value = ''; // Resetear input
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>

                  <span className="ml-2 text-sm text-foreground">
                    {formData.documents ? formData.documents.name : 
                    existingDocument ? 'Documento existente' : 'Ningún archivo seleccionado'}
                  </span>
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                <p className="mt-1 text-xs text-foreground">
                  Formatos aceptados: PDF, JPG, PNG (Máx. 10MB)
                </p>
              </div>
            )}
          </FileValidator>

          {/* Declaración y Confirmación */}
          <div className="mt-6 p-4 bg-card rounded-md">
            <h3 className="text-lg font-medium mb-2 text-foreground">Declaración y Confirmación</h3>
            <p className="text-sm mb-3 text-foreground">
              "Declaro que la información proporcionada es correcta y entiendo que la aprobación de esta licencia está sujeta a las políticas de la empresa."
            </p>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="declaration"
                checked={formData.declaration}
                onChange={handleChange}
                className="h-4 w-4 text-primary-text focus:ring-primary-border border-border rounded"
                required
              />
              <span className="ml-2 text-sm text-foreground">Acepto la declaración</span>
            </label>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <Link
            to={-1}
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-card cursor-pointer"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover flex items-center cursor-pointer"
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