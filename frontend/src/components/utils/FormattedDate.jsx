import PropTypes from 'prop-types';

/**
 * Componente para formatear fechas siempre en hora de Argentina (GMT-3)
 * @param {string} dateString - La fecha a formatear (en formato ISO o similar)
 * @param {boolean} [showTime=true] - Si debe mostrar la hora
 * @returns {object} Objeto con las propiedades formateadas { date, time, datetime }
 */
export const FormattedDate = ({ 
  dateString, 
  showTime = true
}) => {
  if (!dateString) {
    return {
      date: 'No disponible',
      time: 'No disponible',
      datetime: 'No disponible'
    };
  }

  try {
    // Crear fecha y ajustar a GMT-3 (Argentina)
    const date = new Date(dateString);
    
    // Obtener diferencia horaria para Argentina (GMT-3)
    const offsetArgentina = -3 * 60; // -3 horas en minutos
    const localOffset = date.getTimezoneOffset(); // Offset local en minutos
    const argentinaTime = new Date(date.getTime() + (localOffset - offsetArgentina) * 60000);
    
    // Opciones para formatear la fecha
    const dateOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires'
    };
    
    // Opciones para formatear la hora
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires'
    };
    
    // Formatear componentes
    const formattedDate = argentinaTime.toLocaleDateString('es-AR', dateOptions);
    const formattedTime = showTime 
      ? date.toLocaleTimeString('es-AR', timeOptions) + ' hs' 
      : null;
    
    return {
      date: formattedDate,
      time: formattedTime,
      datetime: showTime 
        ? `${formattedDate} ${formattedTime}`
        : formattedDate
    };
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return {
      date: 'No disponible',
      time: 'No disponible',
      datetime: 'No disponible'
    };
  }
};

FormattedDate.propTypes = {
  dateString: PropTypes.string,
  showTime: PropTypes.bool
};

FormattedDate.defaultProps = {
  showTime: true
};

export const formatSimpleDate = (dateString) => {
  if (!dateString) return 'No disponible';
  
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'No disponible';
  }
};