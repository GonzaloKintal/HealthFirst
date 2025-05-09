import { FiUser, FiMail, FiPhone, FiCreditCard, FiCalendar, FiBriefcase, FiClock } from 'react-icons/fi';
import { getUser } from '../../services/userService';
import { useEffect, useState } from 'react';

const MyDataPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener el ID del usuario desde localStorage
        const authData = localStorage.getItem('auth_data');
        const user = authData ? JSON.parse(authData).user : null;
        const userId = user?.id;
        
        if (userId) {
          const response = await getUser(userId);
          setUserData(response);
        } else {
          setError('No se pudo identificar al usuario');
        }
      } catch (err) {
        setError('Error al cargar los datos del usuario');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const calculateAntiquity = (hireDate) => {
    if (!hireDate) return 'No especificado';
    
    const hire = new Date(hireDate);
    const today = new Date();
    
    // Asegurarnos de que las horas no afecten el cálculo de días
    hire.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    let years = today.getFullYear() - hire.getFullYear();
    let months = today.getMonth() - hire.getMonth();
    let days = today.getDate() - hire.getDate();
    
    if (days < 0) {
      months--;
      // Obtener los días del mes anterior
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Pluralización
    const yearsText = years > 0 ? `${years} año${years !== 1 ? 's' : ''}` : '';
    const monthsText = months > 0 ? `${months} mes${months !== 1 ? 'es' : ''}` : '';
    const daysText = days > 0 ? `${days} día${days !== 1 ? 's' : ''}` : '';
    
    // Construir el string resultante
    const parts = [];
    if (yearsText) parts.push(yearsText);
    if (monthsText) parts.push(monthsText);
    if (daysText) parts.push(daysText);
    
    return parts.join(', ') || '0 días';
  };

// Primero, obtenemos las fechas formateadas como strings
const formattedBirthDate = userData?.date_of_birth 
  ? new Date(userData.date_of_birth).toLocaleDateString('es-AR', { 
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  : null;

const formattedJoinedDate = userData?.employment_start_date
  ? new Date(userData.employment_start_date).toLocaleDateString('es-AR', { 
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  : null;

  const getRoleInSpanish = (role) => {
    const roleMap = {
      'employee': 'Empleado',
      'supervisor': 'Supervisor',
      'analyst': 'Analista',
      'admin': 'Administrador'
    };
    return roleMap[role] || role;
  }

  const dataFields = [
    { label: 'Nombre', value: userData?.first_name, icon: <FiUser className="mr-2" /> },
    { label: 'Apellido', value: userData?.last_name, icon: <FiUser className="mr-2" /> },
    { label: 'DNI', value: userData?.dni?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, "."), icon: <FiCreditCard className="mr-2" /> },
    { label: 'Fecha de nacimiento', value: formattedBirthDate, icon: <FiCalendar className="mr-2" /> },

    { label: 'Correo electrónico', value: userData?.email, icon: <FiMail className="mr-2" /> },
    { label: 'Teléfono', value: '+54 ' + userData?.phone, icon: <FiPhone className="mr-2" /> },
    { label: 'Rol', value: getRoleInSpanish(userData?.role), icon: <FiUser className="mr-2" /> },
    { label: 'Departamento', value: userData?.department, icon: <FiBriefcase className="mr-2" /> },
    { label: 'Fecha de ingreso a la empresa', value: formattedJoinedDate, icon: <FiCalendar className="mr-2" /> },
    
    { label: 'Antigüedad', value: userData?.employment_start_date ? calculateAntiquity(userData.employment_start_date) : null, icon: <FiClock className="mr-2" /> }
  ].filter(field => field.value !== null && field.value !== undefined);

  // Verificar si se debe mostrar el mensaje
  const shouldShowUpdateMessage = ['employee', 'supervisor', 'analyst'].includes(userData?.role);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FiUser className="mr-2" />
          Mis Datos
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataFields.map((data, index) => (
            <div key={index} className="border-b border-gray-100 pb-4">
              <div className="text-sm font-medium text-gray-500 flex items-center">
                {data.icon}
                {data.label}
              </div>
              <div className="mt-1 text-lg font-medium text-gray-900">
                {data.value || 'No especificado'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {shouldShowUpdateMessage && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-blue-700">
            Para actualizar tus datos personales, por favor contacta a un <strong>administrador</strong> del sistema.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyDataPage;