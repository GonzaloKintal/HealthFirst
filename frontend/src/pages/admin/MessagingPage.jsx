import { useState, useEffect } from 'react';
import { FiMail, FiSend, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Notification from '../../components/utils/Notification';
import { getEmailStats, getEmailEvents } from '../../services/messagingService';
import SendMessageForm from '../../components/supervisor/SendMessageForm';
import MessagingStats from '../../components/supervisor/MessagingStats';

const MessagingPage = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    events: true
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading({ stats: true, events: true });
      
      const statsResponse = await getEmailStats();
      const eventsResponse = await getEmailEvents();
      
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      } else {
        setError(statsResponse.error);
      }
      
      if (eventsResponse.success) {
        setEvents(eventsResponse.events);
      } else {
        setError(eventsResponse.error);
      }
    } catch (error) {
      setError('Error al cargar los datos de mensajería. Por favor intenta nuevamente.');
      console.error(error);
    } finally {
      setLoading({ stats: false, events: false });
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleRefresh = () => {
    fetchData();
    showNotification('success', 'Datos actualizados correctamente');
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3 md:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center text-foreground">
            <FiMail className="inline mr-2" />
            Panel de Mensajería
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {/* Sección de Estadísticas */}
      <div className="mb-6 overflow-hidden rounded-lg shadow-sm border border-border">
        <button
          onClick={() => setExpandedSection(expandedSection === 'stats' ? '' : 'stats')}
          className="w-full flex justify-between items-center p-4 bg-background transition-colors hover:bg-card"
        >
          <div className="flex items-center">
            <FiMail className="mr-2 text-blue-500" />
            <h2 className="text-lg font-semibold text-foreground">Estadísticas de Correos</h2>
          </div>
          <span className="text-foreground">
            {expandedSection === 'stats' ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSection === 'stats' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-4 bg-background border-t border-border">
            <MessagingStats 
              stats={stats} 
              events={events} 
              loading={loading} 
              onRefresh={handleRefresh} 
            />
          </div>
        </div>
      </div>

      {/* Sección de Enviar Mensaje */}
      <div className="overflow-hidden rounded-lg shadow-sm border border-border">
        <button
          onClick={() => setExpandedSection(expandedSection === 'send' ? '' : 'send')}
          className="w-full flex justify-between items-center p-4 bg-background transition-colors hover:bg-card"
        >
          <div className="flex items-center">
            <FiSend className="mr-2 text-green-500" />
            <h2 className="text-lg font-semibold text-foreground">Enviar Mensaje Personalizado</h2>
          </div>
          <span className="text-foreground">
            {expandedSection === 'send' ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSection === 'send' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-4 bg-background border-t border-border">
            <SendMessageForm onSuccess={() => {
              showNotification('success', 'Mensaje enviado correctamente');
              fetchData();
            }} />
          </div>
        </div>
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

export default MessagingPage;