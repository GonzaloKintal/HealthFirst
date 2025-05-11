

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCalendar, FiUpload, FiUser, FiFileText } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Notification from '../utils/Notification';
import { getUser, getUsers } from '../../services/userService';
import { requestLicense, getLicenseTypes } from '../../services/licenseService';
import FileValidator from '../utils/FileValidator';

const RequestLicense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    licenseTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    documents: null,
    declaration: false,
    selectedEmployee: ''
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [notification, setNotification] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [licenseTypes, setLicenseTypes] = useState([]);

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
        // Solo si no es admin (para empleados y supervisores)
        if (user?.role !== 'admin') {
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
      };
    }
    
    // Para empleados/analistas o cuando no hay empleado seleccionado
    // Usamos currentUserData si está disponible (datos completos del usuario)
    if (currentUserData) {
      return {
        firstName: currentUserData.first_name || '',
        lastName: currentUserData.last_name || '',
        dni: currentUserData.dni || '',
        department: currentUserData.department || '',
        phone: currentUserData.phone || '',
      };
    }
    
    // Fallback a los datos básicos del user de useAuth
    return {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      dni: user?.dni || '',
      department: user?.department || '',
      phone: user?.phone || '',
    };
  };

  const employeeData = getEmployeeData();

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
      reader.onload = () => resolve(reader.result.split(',')[1]); // Extrae solo el Base64
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
      // Obtener el user_id correcto según el rol
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
  
      // Preparar los datos en el formato exacto que espera el backend
      const certificate = formData.documents 
        ? {
            validation: true,
            file: await readFileAsBase64(formData.documents)
          }
        : {
            validation: false,
            file: ""
          };
  
      const licenseData = {
        user_id: Number(userId),
        type_id: Number(formData.licenseTypeId),
        start_date: formData.startDate,
        end_date: formData.endDate,
        information: formData.reason,
        certificate
      };
      
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
        startDate: '',
        endDate: '',
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
      
      <h1 className="text-2xl font-bold mb-6">Solicitar Licencia</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Datos Personales */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUser className="mr-2" /> Datos Personales
          </h2>
          
          {/* Selector de empleados para admin/supervisor */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Empleado *</label>
              <select
                name="selectedEmployee"
                value={formData.selectedEmployee}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingEmployees}
              >
                <option value="">Seleccionar empleado</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} ({employee.dni})
                  </option>
                ))}
              </select>
              {loadingEmployees && <p className="text-sm text-gray-500 mt-1">Cargando empleados...</p>}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={employeeData.firstName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={employeeData.lastName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 items-center">
                  DNI
              </label>
              <input
                type="text"
                value={employeeData.dni}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento/Área</label>
              <input
                type="text"
                value={employeeData.department}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                type="text"
                value={employeeData.phone}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Sección de Detalles de la Licencia */}
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
                min={new Date().toISOString().split('T')[0]}
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
                min={formData.startDate || new Date().toISOString().split('T')[0]}
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
              placeholder="Describa el motivo de su solicitud..."
            />
          </div>
        </div>

        {/* Sección de Documentación */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUpload className="mr-2" /> Documentación Adjunta
          </h2>
          
          <FileValidator onValidation={(result) => {
            if (!result.isValid && result.error) {
              setNotification({ type: 'error', message: result.error });
            }
          }}>
            {({ validateFile, error }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjuntar Documento (opcional)
                </label>
                
                <div className="mt-1 flex items-center">
                  <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <FiFileText className="inline mr-2 text-lg" />
                    Seleccionar archivo
                    <input
                      type="file"
                      name="documents"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (validateFile(file)) {
                          handleChange(e);
                        } else {
                          e.target.value = ''; // Resetear input si no es válido
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </label>
                  <span className="ml-2 text-sm text-gray-500">
                    {formData.documents ? formData.documents.name : 'Ningún archivo seleccionado'}
                  </span>
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Formatos aceptados: PDF, PNG, JPG, JPEG (Máx. 10MB)
                </p>
              </div>
            )}
          </FileValidator>

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

        {/* Botón de envío */}
        <div className="flex justify-end space-x-3">
          <Link
            to={'/licenses'}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={(user?.role === 'admin' || user?.role === 'supervisor') && !formData.selectedEmployee}
          >
            Enviar Solicitud
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestLicense;