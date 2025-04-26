import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiBriefcase, FiSave, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Notification from '../common/Notification';

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });

  const [notification, setNotification] = useState(null);

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'analyst', label: 'Analista' },
    { value: 'employee', label: 'Empleado' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setNotification(null);
  
    if (formData.password !== formData.confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Las contraseñas no coinciden'
      });
      return;
    }
  
    if (formData.password.length < 6) {
      setNotification({
        type: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }
  
    setNotification({
      type: 'success',
      message: 'Usuario creado exitosamente'
    });
  
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee'
      });
    }, 2000);
  };
  
  const startAutoClose = () => {
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);
  
    return () => clearTimeout(timer);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto relative">
      
      {notification && (
        <Notification 
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={3000} // 3 segundos
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crear Nuevo Usuario</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Información Básica */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUser className="mr-2" /> Información Básica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Juan Pérez"
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
              name="role"
              value={formData.role}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
          >
            <FiSave className="mr-2" />
            Guardar Usuario
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;