import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

const SessionTimeout = () => {
  const { logout, refreshAuthToken, token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = (payload.exp * 1000 - Date.now()) / 1000;
        
        if (expiresIn <= 60 && expiresIn > 0 && !sessionExpired) {
          setShowModal(true);
          setCountdown(Math.floor(expiresIn));
        } else if (expiresIn <= 0) {
          setSessionExpired(true);
          setCountdown(0);
        }
      } catch (error) {
        console.error('Error:', error);
        setSessionExpired(true);
      }
    };

    const interval = setInterval(checkTokenExpiration, 1000);
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [token, sessionExpired]);

  useEffect(() => {
    if (!showModal) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setSessionExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal]);

  const handleExtendSession = async () => {
    setIsRefreshing(true);
    try {
      await refreshAuthToken();
      setShowModal(false);
      setSessionExpired(false);
    } catch (error) {
      setSessionExpired(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!showModal) return null;

  
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-3">
            <div className="fixed inset-0 bg-black bg-opacity-50"></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-xs w-full p-4">
            <h3 className="text-base font-bold mb-3 text-foreground">
                {sessionExpired ? 'Sesión Expirada' : 'Sesión por expirar'}
            </h3>
            
            {sessionExpired ? (
                <p className="mb-3 text-sm text-foreground">Tu sesión ha expirado. Por favor cierra sesión e ingresa nuevamente.</p>
            ) : (
                <p className="mb-3 text-sm text-foreground">Tu sesión expirará en {countdown} segundos.</p>
            )}

            <div className="flex justify-end space-x-2">
                {!sessionExpired && (
                <button
                    onClick={handleExtendSession}
                    disabled={isRefreshing}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {isRefreshing ? 'Extendiendo...' : 'Extender sesión'}
                </button>
                )}
                
                <button
                onClick={logout}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 rounded text-foreground"
                >
                Cerrar sesión
                </button>
            </div>
            </div>
        </div>
        </div>
    );
};

export default SessionTimeout;