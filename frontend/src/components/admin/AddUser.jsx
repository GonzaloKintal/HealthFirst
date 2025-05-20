import { useState } from 'react';
import { FiUser, FiSave, FiBriefcase, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../utils/Notification';
import { addUser } from '../../services/userService';
import StyledDatePicker from '../utils/StyledDatePicker';
import es from 'date-fns/locale/es';
import { 
  validateName, 
  validateAge, 
  validateDNI, 
  validatePhone, 
  validatePassword,
  validateEmail
} from '../utils/Validations';

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
    date_of_birth: null,
    department: '',
    employment_start_date: null,
    role_name: 'employee'
  });

  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

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

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);
    setIsSubmitting(true);
  
    // Validaciones
    if (!validateName(formData.first_name)) {
      setNotification({
        type: 'error',
        message: 'Nombre inválido. Solo letras y espacios permitidos'
      });
      setIsSubmitting(false);
      return;
    }
  
    if (!validateName(formData.last_name)) {
      setNotification({
        type: 'error',
        message: 'Apellido inválido. Solo letras y espacios permitidos'
      });
      setIsSubmitting(false);
      return;
    }
  
    if (!validateDNI(formData.dni)) {
      setNotification({
        type: 'error',
        message: 'DNI inválido. Debe tener 7 u 8 dígitos'
      });
      setIsSubmitting(false);
      return;
    }
  
    if (!validateAge(formData.date_of_birth)) {
      setNotification({
        type: 'error',
        message: 'El usuario debe ser mayor de edad (18 años o más)'
      });
      setIsSubmitting(false);
      return;
    }
  
    if (!validatePhone(formData.phone)) {
      setNotification({
        type: 'error',
        message: 'Teléfono inválido. Debe tener entre 10 y 15 dígitos'
      });
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setNotification({
        type: 'error',
        message: 'Correo electrónico inválido'
      });
      setIsSubmitting(false);
      return;
    }
  
    if (!validatePassword(formData.password)) {
      setNotification({
        type: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
      setIsSubmitting(false);
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Las contraseñas no coinciden'
      });
      setIsSubmitting(false);
      return;
    }
  
    try {
      // Preparamos los datos para enviar
      const userData = {
        ...formData,
        date_of_birth: formData.date_of_birth ? formData.date_of_birth.toISOString().split('T')[0] : '',
        employment_start_date: formData.employment_start_date ? formData.employment_start_date.toISOString().split('T')[0] : '',
        confirmPassword: undefined
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
          date_of_birth: null,
          department: '',
          employment_start_date: null,
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
        <h1 className="text-2xl font-bold text-foreground">Crear Nuevo Usuario</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete='off'>
        {/* Sección de Información Personal */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
            <FiUser className="mr-2" /> Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground ${
                  formData.first_name && !validateName(formData.first_name) 
                    ? 'border-red-500' 
                    : 'border-border'
                }`}
                placeholder="Ej: Luis"
              />
              {formData.first_name && !validateName(formData.first_name) && (
                <p className="mt-1 text-xs text-red-500">Nombre inválido. Solo letras y espacios permitidos</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Apellido *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground ${
                  formData.last_name && !validateName(formData.last_name) 
                    ? 'border-red-500' 
                    : 'border-border'
                }`}
                placeholder="Ej: Pérez"
              />
              {formData.last_name && !validateName(formData.last_name) && (
                <p className="mt-1 text-xs text-red-500">Apellido inválido. Solo letras y espacios permitidos</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                DNI *
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground ${
                  formData.dni && !validateDNI(formData.dni) 
                    ? 'border-red-500' 
                    : 'border-border'
                }`}
                placeholder="Ej: 12345678"
              />
              {formData.dni && !validateDNI(formData.dni) && (
                <p className="mt-1 text-xs text-red-500">DNI inválido. Debe tener 7 u 8 dígitos</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Nacimiento *</label>
              <StyledDatePicker
                selected={formData.date_of_birth}
                onChange={(date) => handleDateChange(date, 'date_of_birth')}
                required
                locale={es}
                dateFormat="dd/MM/yyyy"
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground ${
                  formData.date_of_birth && !validateAge(formData.date_of_birth) 
                    ? 'border-red-500' 
                    : 'border-border'
                }`}
                placeholderText="Seleccione una fecha"
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                peekNextMonth
                showMonthDropdown
              />
              {formData.date_of_birth && !validateAge(formData.date_of_birth) && (
                <p className="mt-1 text-xs text-red-500">El usuario debe ser mayor de edad (18 años o más)</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground ${
                  formData.phone && !validatePhone(formData.phone) 
                    ? 'border-red-500' 
                    : 'border-border'
                }`}
                placeholder="Ej: 1123456789"
              />
              {formData.phone && !validatePhone(formData.phone) && (
                <p className="mt-1 text-xs text-red-500">Teléfono inválido. Debe tener entre 10 y 15 dígitos</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground ${
                  formData.email && !validateEmail(formData.email) 
                    ? 'border-red-500' 
                    : 'border-border'
                }`}
                placeholder="Ej: usuario@empresa.com"
              />
              {formData.email && !validateEmail(formData.email) && (
                <p className="mt-1 text-xs text-red-500">Correo electrónico inválido</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Departamento *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground"
              >
                <option value="">Seleccionar departamento</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Ingreso a la Empresa *</label>
              <StyledDatePicker
                selected={formData.employment_start_date}
                onChange={(date) => handleDateChange(date, 'employment_start_date')}
                required
                locale={es}
                dateFormat="dd/MM/yyyy"
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground"
                placeholderText="Seleccione una fecha"
                showYearDropdown
                dropdownMode="select"
                minDate={new Date(2000, 0, 1)}
                peekNextMonth
                showMonthDropdown
              />
            </div>
          </div>
        </div>

        {/* Sección de Credenciales */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
            <FiLock className="mr-2" /> Credenciales de Acceso
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword.password ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground pr-10 ${
                    formData.password && !validatePassword(formData.password) 
                      ? 'border-red-500' 
                      : 'border-border'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => toggleShowPassword('password')}
                >
                  {showPassword.password ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && !validatePassword(formData.password) && (
                <p className="mt-1 text-xs text-red-500">La contraseña debe tener al menos 6 caracteres</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirmar Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground pr-10 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500'
                      : 'border-border'
                  }`}
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => toggleShowPassword('confirmPassword')}
                >
                  {showPassword.confirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Rol */}
        <div className="bg-background p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
            <FiBriefcase className="mr-2" /> Rol y Permisos
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rol del Usuario *</label>
            <select
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-primary-border focus:border-primary-border bg-background text-foreground"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-foreground">
              Seleccione el nivel de acceso que tendrá este usuario
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <Link
            to="/users"
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-card cursor-pointer"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover flex items-center ${
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