import api from './api';

// Obtener estadísticas de emails
export const getEmailStats = async () => {
  try {
    const response = await api.get('/messaging/get_email_stats');
    return {
      success: true,
      stats: response.data.stats || {}
    };
  } catch (error) {
    console.error('Error in getEmailStats:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener Las siguientes estadísticas de emails. Por favor intenta nuevamente.',
      stats: {}
    };
  }
};

// Obtener eventos de emails con paginación y filtros
export const getEmailEvents = async (limit = 10, offset = 0) => {
  try {
    const response = await api.post('/messaging/get_email_events', {
      limit: limit,
      offset: offset
    });
    
    return {
      success: true,
      events: response.data.events?.events || []
    };
  } catch (error) {
    console.error('Error fetching email events:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener eventos de email',
      events: []
    };
  }
};


export const getUserEmailEvents = async (id, limit = 10, offset = 0) => {
  try {
    const response = await api.post('/messaging/get_user_email_events', {
      user_id: id,
      limit: limit,
      offset: offset
    });

    return {
      success: true,
      events: response.data.events?.events || []
    };
  } catch (error) {
    console.error('Error fetching email events:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener eventos de email del usuario',
      events: []
    };
  }
};


export const sendPersonalizedMessage = async (userId, subject, message) => {
  try {
    const response = await api.post('/messaging/send_personalized_message', {
      user_id: userId,
      subject,
      message
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending personalized message:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al enviar el mensaje personalizado'
    };
  }
};