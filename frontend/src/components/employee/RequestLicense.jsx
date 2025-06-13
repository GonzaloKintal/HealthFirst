

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCalendar, FiUpload, FiUser, FiFileText, FiSend} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Notification from '../utils/Notification';
import { getUser, getUsers } from '../../services/userService';
import { requestLicense, getLicenseTypes } from '../../services/licenseService';
import FileValidator from '../utils/FileValidator';
import EmployeeSelector from '../supervisor/EmployeeSelector';
import StyledDatePicker from '../utils/StyledDatePicker';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { formatArgentinaDate } from '../utils/FormattedDate';
import AlertWithDownload from './AlertWithDownload';

const RequestLicense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    licenseTypeId: '',
    licenseTypeName: '',
    startDate: null,
    endDate: null,
    reason: '',
    documents: null,
    declaration: false,
    selectedEmployee: ''
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [notification, setNotification] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Cargar datos del usuario actual cuando el componente se monta
  useEffect(() => {
    const fetchCurrentUserData = async () => {
      try {
        // Solo para empleados y analistas
        if (user?.role === 'employee' || user?.role === 'analyst') {
          const response = await getUser(user.id);
          setCurrentUserData(response);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        setNotification({
          type: 'error',
          message: 'Error al cargar tus datos personales'
        });
      }
    };
    
    fetchCurrentUserData();
  }, [user]);

  // Cargar lista de empleados si el usuario es admin o supervisor
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'supervisor') {
      const fetchEmployees = async () => {
        setLoadingEmployees(true);
        try {
          const response = await getUsers();
          // Filtrar solo empleados y analistas (excluyendo otros admins/supervisores)
          const filteredEmployees = response.users.filter(u => 
            u.role === 'employee' || u.role === 'analyst'
          );
          setEmployees(filteredEmployees);
        } catch (error) {
          setNotification({
            type: 'error',
            message: 'Error al cargar la lista de empleados'
          });
        } finally {
          setLoadingEmployees(false);
        }
      };
      
      fetchEmployees();
    }
  }, [user?.role]);

  // Cargar datos del empleado seleccionado (solo para admin/supervisor)
  useEffect(() => {
    if (formData.selectedEmployee && (user?.role === 'admin' || user?.role === 'supervisor')) {
      const fetchEmployeeData = async () => {
        try {
          const response = await getUser(formData.selectedEmployee);
          setSelectedEmployeeData(response);
        } catch (error) {
          console.error("Error al cargar empleado:", error);
          setNotification({
            type: 'error',
            message: 'Error al cargar los datos del empleado'
          });
        }
      };
      
      fetchEmployeeData();
    }
  }, [formData.selectedEmployee, user?.role]);

// Cargar tipos de licencia cuando el componente se monta
useEffect(() => {
  const fetchLicenseTypes = async () => {
    try {
      const response = await getLicenseTypes();
      if (response.success) {
        setLicenseTypes(response.data.types);
      } else {
        console.error('Error al obtener tipos de licencia:', response.error);
        setNotification({
          type: 'error',
          message: 'Error al cargar los tipos de licencia disponibles'
        });
      }
    } catch (error) {
      console.error('Error fetching license types:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los tipos de licencia'
      });
    }
  };
  
  fetchLicenseTypes();
}, []);

  // Datos personales basados en el rol
  const getEmployeeData = () => {
  // Si es admin/supervisor y hay un empleado seleccionado
  if ((user?.role === 'admin' || user?.role === 'supervisor') && selectedEmployeeData) {
    return {
      firstName: selectedEmployeeData.first_name || '',
      lastName: selectedEmployeeData.last_name || '',
      dni: selectedEmployeeData.dni || '',
      department: selectedEmployeeData.department || '',
      phone: selectedEmployeeData.phone || '',
      dateOfBirth: selectedEmployeeData.date_of_birth || '',
    };
  }
  
  // Para empleados/analistas
  if (user?.role === 'employee' || user?.role === 'analyst') {
    if (currentUserData) {
      return {
        firstName: currentUserData.first_name || '',
        lastName: currentUserData.last_name || '',
        dni: currentUserData.dni || '',
        department: currentUserData.department || '',
        phone: currentUserData.phone || '',
        dateOfBirth: currentUserData.date_of_birth || '',
      };
    }
    
    return {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      dni: user?.dni || '',
      department: user?.department || '',
      phone: user?.phone || '',
      dateOfBirth: user?.date_of_birth || '',
    };
  }

  return {
    firstName: '',
    lastName: '',
    dni: '',
    department: '',
    phone: '',
    dateOfBirth: '',
  };
};

  const employeeData = getEmployeeData();

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (name === 'licenseTypeId') {
      const selectedType = licenseTypes.find(type => type.id === Number(value));
      setFormData(prev => ({
        ...prev,
        licenseTypeId: value,
        licenseTypeName: selectedType?.name || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (files ? files[0] : value)
      }));
    }
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
      reader.onload = () => resolve(reader.result.split(',')[1]); // Extrae solo el Base64
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (!formData.declaration) {
      setNotification({
        type: 'error',
        message: 'Debe aceptar la declaración para enviar la solicitud.'
      });
      return;
      setIsSubmitting(false);
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
  
    if ((user?.role === 'admin' || user?.role === 'supervisor') && !formData.selectedEmployee) {
      setNotification({
        type: 'error',
        message: 'Debe seleccionar un empleado para continuar.'
      });
      return;
    }
    
    if (formData.documents) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(formData.documents.type)) {
        setNotification({
          type: 'error',
          message: 'Formato de archivo no válido. Solo se permiten PDF, PNG, JPG o JPEG.'
        });
        return;
      }
      
      if (formData.documents.size > maxSize) {
        setNotification({
          type: 'error',
          message: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
        });
        return;
      }
    }
    
    try {
      let userId;
      if (user?.role === 'admin' || user?.role === 'supervisor') {
        userId = formData.selectedEmployee;
      } else {
        const authData = localStorage.getItem('auth_data');
        userId = authData ? JSON.parse(authData).user.id : user?.id;
      }
  
      if (!userId) {
        throw new Error('No se pudo determinar el usuario');
      }

      const formatDate = (date) => date ? format(date, 'yyyy-MM-dd') : '';
  
      // Preparar los datos para el backend
      const licenseData = {
        user_id: Number(userId),
        type_id: Number(formData.licenseTypeId),
        start_date: formatDate(formData.startDate),
        end_date: formatDate(formData.endDate),
        information: formData.reason
      };
  
      // Solo agregar certificado si hay documento
      if (formData.documents) {
        licenseData.certificate = {
          validation: false,
          file: await readFileAsBase64(formData.documents)
        };
      }
      
      // Enviar la solicitud
      await requestLicense(licenseData);
      
      // Éxito
      setNotification({
        type: 'success',
        message: 'Tu solicitud de licencia ha sido enviada correctamente.'
      });
      
      // Resetear formulario
      setFormData({
        licenseTypeId: '',
        startDate: null,
        endDate: null,
        reason: '',
        documents: null,
        declaration: false,
        selectedEmployee: ''
      });
      setCalculatedDays(0);
      setSelectedEmployeeData(null);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/licenses');
      }, 3000);
    } catch (error) {
      console.error('Error completo:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 
                 error.response?.data?.error || 
                 'Ocurrió un error al enviar tu solicitud.'
      });
    } finally {
        setIsSubmitting(false);
      }
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
      
      <h1 className="text-xl sm:text-2xl mb-6 font-bold flex items-center text-foreground">
        <FiSend className="mr-2" />
        Solicitar Licencia
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete='off'>
        {/* Sección de Datos Personales */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center text-foreground">
            <FiUser className="mr-2" /> Datos Personales
          </h2>
          
          {/* Selector de empleados para admin/supervisor */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <EmployeeSelector 
              selectedEmployee={formData.selectedEmployee}
              onEmployeeSelected={(value) => setFormData(prev => ({ ...prev, selectedEmployee: value }))}
              initialEmployees={employees}
              roles={['employee']}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
              <input
                type="text"
                value={employeeData.firstName}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Apellido</label>
              <input
                type="text"
                value={employeeData.lastName}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 items-center">
                  DNI
              </label>
              <input
                type="text"
                value={employeeData.dni}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Nacimiento</label>
              <input
                type="text"
                value={employeeData.dateOfBirth ? formatArgentinaDate(employeeData.dateOfBirth, false) : ''}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Departamento/Área</label>
              <input
                type="text"
                value={employeeData.department}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Número</label>
              <input
                type="text"
                value={employeeData.phone}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Sección de Detalles de la Licencia */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center text-foreground">
            <FiCalendar className="mr-2 text-foreground" /> Detalles de la Licencia
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tipo de Licencia *</label>
            <select
              name="licenseTypeId"
              value={formData.licenseTypeId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground"
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
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
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
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground resize-none"
              placeholder="Describa el motivo de su solicitud..."
            />
          </div>
        </div>

        {/* Sección de Documentación */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center text-foreground">
            <FiUpload className="mr-2 text-foreground" /> Documentación Adjunta
          </h2>

          {licenseTypes.find(type => type.id === Number(formData.licenseTypeId))?.name.toLowerCase() === 'enfermedad' && (
            <AlertWithDownload />
          )}

          
          <FileValidator onValidation={(result) => {
            if (!result.isValid && result.error) {
              setNotification({ type: 'error', message: result.error });
            }
          }}>
            {({ validateFile, error }) => (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Adjuntar Documento
                </label>
                
                <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center">
                  <label className="cursor-pointer bg-background py-2 px-3 border border-border rounded-md shadow-sm text-sm leading-4 font-medium text-foreground hover:bg-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-border">
                    <FiFileText className="inline mr-2 text-lg text-foreground" />
                    Seleccionar archivo
                    <input
                      type="file"
                      name="documents"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (validateFile(file)) {
                          handleChange(e);
                        } else {
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </label>
                  <span className="ml-2 text-sm text-foreground">
                    {formData.documents ? formData.documents.name : 'Ningún archivo seleccionado'}
                  </span>
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                <p className="mt-1 text-xs text-foreground">
                  Formatos aceptados: PDF, PNG, JPG, JPEG (Máx. 10MB)
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
                className="h-4 w-4 text-foreground focus:ring-primary-border border-border rounded"
                required
              />
              <span className="ml-2 text-sm text-foreground">Acepto la declaración</span>
            </label>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-end space-x-3">
          <Link
            to={'/licenses'}
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-card cursor-pointer"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting || (user?.role === 'admin' || user?.role === 'supervisor') && !formData.selectedEmployee}
          >
            Enviar Solicitud
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestLicense;