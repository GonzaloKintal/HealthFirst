import { FiUser, FiMail, FiPhone, FiCreditCard, FiCalendar, FiBriefcase, FiClock } from 'react-icons/fi';
import { getUser } from '../../services/userService';
import { useEffect, useState } from 'react';
import { FormattedDate } from '../../components/utils/FormattedDate';

const MyDataPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {

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
        setError('Error al cargar los datos del usuario. Por favor intenta nuevamente.');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Función para formatear fechas usando FormattedDate
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        return null;
      }
      return FormattedDate({ dateString, showTime: false }).date;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  };

  const calculateAntiquity = (hireDate) => {
    if (!hireDate) return 'No especificado';
    
    const hire = new Date(hireDate);
    const today = new Date();
    
    hire.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    let years = today.getFullYear() - hire.getFullYear();
    let months = today.getMonth() - hire.getMonth();
    let days = today.getDate() - hire.getDate();
    
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const yearsText = years > 0 ? `${years} año${years !== 1 ? 's' : ''}` : '';
    const monthsText = months > 0 ? `${months} mes${months !== 1 ? 'es' : ''}` : '';
    const daysText = days > 0 ? `${days} día${days !== 1 ? 's' : ''}` : '';
    
    const parts = [];
    if (yearsText) parts.push(yearsText);
    if (monthsText) parts.push(monthsText);
    if (daysText) parts.push(daysText);
    
    return parts.join(', ') || '0 días';
  };

  const getRoleInSpanish = (role) => {
    const roleMap = {
      'employee': 'Empleado',
      'supervisor': 'Supervisor',
      'analyst': 'Analista',
      'admin': 'Administrador'
    };
    return roleMap[role] || role;
  };

  // Preparamos los valores de fecha fuera del dataFields
  const birthDate = formatDate(userData?.date_of_birth);
  const joinedDate = formatDate(userData?.employment_start_date);
  const antiquity = userData?.employment_start_date ? calculateAntiquity(userData.employment_start_date) : null;

  const dataFields = [
    { label: 'Nombre', value: userData?.first_name, icon: <FiUser className="mr-2" /> },
    { label: 'Apellido', value: userData?.last_name, icon: <FiUser className="mr-2" /> },
    { label: 'DNI', value: userData?.dni?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, "."), icon: <FiCreditCard className="mr-2" /> },
    { label: 'Fecha de nacimiento', value: birthDate, icon: <FiCalendar className="mr-2" /> },
    { label: 'Correo electrónico', value: userData?.email, icon: <FiMail className="mr-2" /> },
    { label: 'Teléfono', value: '+54 ' + userData?.phone, icon: <FiPhone className="mr-2" /> },
    { label: 'Rol', value: getRoleInSpanish(userData?.role), icon: <FiUser className="mr-2" /> },
    { label: 'Departamento', value: userData?.department, icon: <FiBriefcase className="mr-2" /> },
    { label: 'Fecha de ingreso a la empresa', value: joinedDate, icon: <FiCalendar className="mr-2" /> },
    { label: 'Antigüedad', value: antiquity, icon: <FiClock className="mr-2" /> }
  ].filter(field => field.value !== null && field.value !== undefined);

  const shouldShowUpdateMessage = ['employee', 'supervisor', 'analyst'].includes(userData?.role);

  return (
    <div className="bg-background p-6 rounded-lg shadow text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
          <FiUser className="mr-2" />
          Mis Datos
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="bg-card p-6 rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {dataFields.map((data, index) => (
                <div key={index} className="border-b border-border pb-4">
                  <div className="text-sm font-medium text-foreground flex items-center">
                    {data.icon}
                    {data.label}
                  </div>
                  <div className="mt-1 text-lg font-medium text-foreground">
                    {data.value || 'No especificado'}
                  </div>
                </div>
              ))}
            </div>

            {shouldShowUpdateMessage && (
              <div className="mt-6 p-4 bg-special-light dark:bg-special-dark border-l-4 border-primary-border rounded">
                <p className="text-primary-text">
                  Para actualizar tus datos personales, por favor contacta a un <strong className="text-primary-text">administrador</strong> del sistema.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyDataPage;