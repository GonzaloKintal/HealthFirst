import { useState, useEffect } from 'react';
import { FiMail, FiRefreshCw } from 'react-icons/fi';
import Notification from '../../components/utils/Notification';
import { getUserEmailEvents } from '../../services/messagingService';
import useAuth from '../../hooks/useAuth';

const UserMessagesPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await getUserEmailEvents(user.id);
      if (response.success) {
        setEvents(response.events);
      } else {
        setError(response.error || 'Error al cargar los eventos de correo');
      }
    } catch (error) {
      setError('Error al cargar los eventos de correo. Por favor intenta nuevamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleRefresh = async () => {
    await fetchData();
    showNotification('success', 'Eventos actualizados correctamente');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const formatSender = (sender) => {
    if (sender === 'healthfirst.voxdei@9335019.brevosend.com') {
      return 'Equipo VoxDei';
    }
    return sender;
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3 md:gap-0">
        <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
              <FiMail className="inline mr-2" />
              Mis Mensajes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Historial de eventos de correo electrónico para {user.email}
            </p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-hover transition"
          disabled={loading}
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {/* Sección de Eventos */}
      <div>
        <h2 className="text-md font-semibold mb-4 text-center">Eventos de Correo</h2>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-card">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Remitente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Asunto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Evento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {events.slice(0, 10).map((event, index) => (
                  <tr key={index} className="hover:bg-card">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium">
                        {formatSender(event.from)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm">
                        {formatDate(event.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        {event.subject || 'Sin asunto'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.event === 'delivered' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                          event.event === 'opened' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                          event.event === 'hardBounces' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                          event.event === 'blocked' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' :
                          event.event === 'softBounces' 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' :
                          event.event === 'requests'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {event.event === 'delivered' ? 'Entregado' :
                          event.event === 'opened' ? 'Abierto' :
                          event.event === 'hardBounces' ? 'Rebote duro' :
                          event.event === 'blocked' ? 'Bloqueado' :
                          event.event === 'softBounces' ? 'Rebote suave' :
                          event.event === 'requests' ? 'Solicitado' :
                          event.event}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center">No hay eventos registrados</p>
        )}
      </div>

      {notification.show && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default UserMessagesPage;