import PropTypes from 'prop-types';

/**
 * Componente para formatear fechas de manera genérica
 * @param {string} dateString - La fecha a formatear (en formato ISO o similar)
 * @param {string} [dateFormat] - Formato para la fecha (por defecto 'es-AR')
 * @param {string} [timeFormat] - Formato para la hora (por defecto 'es-AR')
 * @param {boolean} [showTime=true] - Si debe mostrar la hora
 * @returns {object} Objeto con las propiedades formateadas { date, time, datetime }
 */
export const FormattedDate = ({ 
  dateString, 
  dateFormat = 'es-AR', 
  timeFormat = 'es-AR',
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
    const date = new Date(dateString);
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    
    const formattedDate = date.toLocaleDateString(dateFormat, dateOptions);
    const formattedTime = showTime 
      ? date.toLocaleTimeString(timeFormat, timeOptions) + ' hs' 
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
  dateFormat: PropTypes.string,
  timeFormat: PropTypes.string,
  showTime: PropTypes.bool
};