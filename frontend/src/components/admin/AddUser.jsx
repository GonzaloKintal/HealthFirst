
import { useState } from 'react';
import { FiUser, FiSave, FiBriefcase, FiLock } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../common/Notification';
import { addUser } from '../../services/userService';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    date_of_birth: '',
    department_name: '',
    role_name: 'employee'
  });

  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'analyst', label: 'Analista' },
    { value: 'employee', label: 'Empleado' }
  ];

  const departments = [
    'Administración',
    'Recursos Humanos',
    'Tecnología',
    'Operaciones',
    'Ventas',
    'Marketing',
    'Finanzas',
    'Legal'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);
    setIsSubmitting(true);
  
    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Las contraseñas no coinciden'
      });
      setIsSubmitting(false);
      return;
    }
  
    // Validación de longitud mínima de contraseña
    if (formData.password.length < 6) {
      setNotification({
        type: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
      setIsSubmitting(false);
      return;
    }
  
    try {
      // Preparamos los datos para enviar (sin confirmPassword)
      const userData = {
        ...formData,
        confirmPassword: undefined // Eliminamos este campo del objeto a enviar
      };
      delete userData.confirmPassword;
  
      // Llamada al servicio para agregar usuario
      await addUser(userData);
      
      setNotification({
        type: 'success',
        message: 'Usuario creado exitosamente'
      });
  
      // Limpiar formulario después de 2 segundos y redirigir
      setTimeout(() => {
        setFormData({
          first_name: '',
          last_name: '',
          dni: '',
          password: '',
          confirmPassword: '',
          email: '',
          phone: '',
          date_of_birth: '',
          department_name: '',
          role_name: 'employee'
        });
        navigate('/users');
      }, 2000);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      let errorMessage = 'Error al crear el usuario';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 409) {
          errorMessage = 'El email o DNI ya están registrados';
        }
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crear Nuevo Usuario</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Información Personal */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUser className="mr-2" /> Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Luis"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Pérez"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI *
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                pattern="\d{7,8}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 12345678"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="\d{10,15}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 1123456789"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: usuario@empresa.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
              <select
                name="department_name"
                value={formData.department_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar departamento</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

         {/* Sección de Credenciales */}
         <div className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-xl font-semibold mb-4 flex items-center">
             <FiLock className="mr-2" /> Credenciales de Acceso
           </h2>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
               <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Repite la contraseña"
              />
            </div>
          </div>
        </div>

        {/* Sección de Rol */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiBriefcase className="mr-2" /> Rol y Permisos
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol del Usuario *</label>
            <select
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Seleccione el nivel de acceso que tendrá este usuario
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <Link
            to="/users"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
            disabled={isSubmitting}
          >
            <FiSave className="mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;