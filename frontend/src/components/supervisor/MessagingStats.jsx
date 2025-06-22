
import { useState } from 'react';
import { FiRefreshCw, FiChevronLeft, FiChevronRight, FiMail, FiCalendar, FiFileText, FiActivity } from 'react-icons/fi';

const MessagingStats = ({ stats, events, loading, onRefresh, onPageChange, pagination }) => {

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

  const handleNextPage = () => {
    const newOffset = pagination.offset + pagination.limit;
    onPageChange(newOffset);
  };

  const handlePrevPage = () => {
    const newOffset = Math.max(0, pagination.offset - pagination.limit);
    onPageChange(newOffset);
  };

  // Función para obtener el estilo del evento
  const getEventStyle = (eventType) => {
    const styles = {
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'opened': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'hardBounces': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      'blocked': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'softBounces': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      'requests': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'deferred': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    };
    return styles[eventType] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  // Función para obtener el texto del evento
  const getEventText = (eventType) => {
    const texts = {
      'delivered': 'Entregado',
      'opened': 'Abierto',
      'hardBounces': 'Rebote duro',
      'blocked': 'Bloqueado',
      'softBounces': 'Rebote suave',
      'requests': 'Solicitado',
      'deferred': 'Aplazado'
    };
    return texts[eventType] || eventType;
  };

  // Función para obtener el color del icono según el evento
  const getEventIconColor = (eventType) => {
    const colors = {
      'delivered': 'text-green-700 dark:text-green-200 bg-green-200 dark:bg-green-800',
      'opened': 'text-blue-700 dark:text-blue-200 bg-blue-200 dark:bg-blue-800',
      'hardBounces': 'text-red-700 dark:text-red-200 bg-red-200 dark:bg-red-800',
      'blocked': 'text-purple-700 dark:text-purple-200 bg-purple-200 dark:bg-purple-800',
      'softBounces': 'text-orange-700 dark:text-orange-200 bg-orange-200 dark:bg-orange-800',
      'requests': 'text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700',
      'deferred': 'text-yellow-700 dark:text-yellow-200 bg-yellow-200 dark:bg-yellow-800'
    };
    return colors[eventType] || 'text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-hover transition mb-4"
          disabled={loading.stats || loading.events}
        >
          <FiRefreshCw className={`mr-2 ${(loading.stats || loading.events) ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {loading.stats ? (
        <div className="flex justify-center items-center min-h-[100px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Enviados</h4>
              <p className="text-2xl font-bold">{stats.requests}</p>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Entregados</h4>
              <p className="text-2xl font-bold">{stats.delivered}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.requests > 0 ? 
                  `${Math.round((stats.delivered / stats.requests) * 100)}% tasa de entrega` : 
                  '0% tasa de entrega'}
              </p>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Aperturas</h4>
              <p className="text-2xl font-bold">{stats.uniqueOpens}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.delivered > 0 ? 
                  `${Math.round((stats.uniqueOpens / stats.delivered) * 100)}% tasa de apertura` : 
                  '0% tasa de apertura'}
              </p>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Rebotes</h4>
              <p className="text-2xl font-bold">{stats.hardBounces + stats.softBounces}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.hardBounces} duros, {stats.softBounces} suaves
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-4 text-center">Eventos Recientes</h3>
            {loading.events ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : events.length > 0 ? (
              <>
                {/* Vista de tabla - Solo visible en md y superiores */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-card">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                          Email
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
                              {event.email}
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStyle(event.event)}`}>
                                {getEventText(event.event)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista de cards - Solo visible en pantallas pequeñas */}
                <div className="md:hidden">
                  <div className="divide-y divide-border">
                    {events.slice(0, 10).map((event, index) => (
                      <div 
                        key={index}
                        className="p-4 hover:bg-card transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icono del evento */}
                          <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${getEventIconColor(event.event)}`}>
                            <FiActivity className="text-lg" />
                          </div>
                          
                          {/* Contenido principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                              <h3 className="text-sm font-semibold text-foreground pr-2 truncate">
                                {event.email}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 mt-1 sm:mt-0 ${getEventStyle(event.event)}`}>
                                {getEventText(event.event)}
                              </span>
                            </div>
                            
                            {/* Información del evento */}
                            <div className="space-y-1">
                              <div className="flex items-center text-xs text-foreground opacity-75">
                                <FiCalendar className="mr-2 flex-shrink-0" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-start text-xs text-foreground opacity-75">
                                <FiFileText className="mr-2 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">
                                  {event.subject || 'Sin asunto'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center">No hay eventos registrados</p>
            )}
          </div>

          {/* Paginación */}
          <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={handlePrevPage}
                disabled={pagination.offset === 0 || loading.events}
                className="px-2 sm:px-3 py-2 rounded-l-md border border-border bg-background text-xs sm:text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
              >
                <FiChevronLeft className="mr-1" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasMore || loading.events}
                className="px-2 sm:px-3 py-2 rounded-r-md border border-border bg-background text-xs sm:text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <FiChevronRight className="ml-1" />
              </button>
            </nav>
          </div>
        </>
      ) : (
        <p className="text-center">No hay datos de estadísticas disponibles</p>
      )}
    </div>
  );
};

export default MessagingStats;