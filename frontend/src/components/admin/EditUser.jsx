import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiBriefcase, FiSave, FiX } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../common/Notification';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: '',
    role: 'employee'
  });
  const [notification, setNotification] = useState(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Datos de ejemplo para roles y departamentos
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

  // Simulamos la carga de datos del usuario a editar
  useEffect(() => {
    // Aquí deberías hacer una llamada API para obtener los datos del usuario con el id
    // Esto es un mock de los datos
    const mockUserData = {
      id: id,
      firstName: 'Juan',
      lastName: 'Pérez',
      dni: '12345678',
      email: 'juan.perez@empresa.com',
      department: 'Tecnología',
      position: 'Desarrollador Frontend',
      role: 'employee'
    };

    setFormData({
      ...mockUserData,
      password: '',
      confirmPassword: ''
    });
  }, [id]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
  
    // Validaciones solo si se está editando la contraseña
    if (isEditingPassword) {
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
    }

    if (!/^\d{7,8}$/.test(formData.dni)) {
      setNotification({
        type: 'error',
        message: 'El DNI debe tener 7 u 8 dígitos'
      });
      return;
    }
  
    setNotification({
      type: 'success',
      message: 'Usuario actualizado exitosamente'
    });
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      navigate('/users');
    }, 2000);
  };

  const togglePasswordEdit = () => {
    setIsEditingPassword(!isEditingPassword);
    // Resetear campos de contraseña al desactivar la edición
    if (isEditingPassword) {
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
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
        <h1 className="text-2xl font-bold">Editar Usuario</h1>
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
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Sergio"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento/Área *</label>
              <select
                name="department"
                value={formData.department}
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo/Puesto *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Desarrollador Frontend"
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
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Cambiar contraseña</h3>
            <button
              type="button"
              onClick={togglePasswordEdit}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isEditingPassword ? 'Cancelar edición' : 'Editar contraseña'}
            </button>
          </div>
          
          {isEditingPassword && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>
          )}
          {!isEditingPassword && (
            <p className="text-sm text-gray-500">
              Deja los campos de contraseña en blanco si no deseas cambiarla.
            </p>
          )}
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
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancelar
          </button>

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

export default EditUser;