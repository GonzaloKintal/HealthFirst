
import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isInitialized: false
  });

  // Cargar estado inicial del localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedAuth = localStorage.getItem('auth_data');
      
      if (savedAuth) {
        const parsedAuth = JSON.parse(savedAuth);
        
        // Verificar si el token actual está expirado
        const isExpired = isTokenExpired(parsedAuth.token);
        
        if (isExpired && parsedAuth.refreshToken) {
          try {
            // Intentar refrescar el token automáticamente al iniciar
            const response = await api.post('/users/token/refresh', {
              refresh: parsedAuth.refreshToken
            });
            
            const newAuthData = {
              ...parsedAuth,
              token: response.data.access,
              refreshToken: response.data.refresh || parsedAuth.refreshToken,
              isAuthenticated: true
            };
            
            localStorage.setItem('auth_data', JSON.stringify(newAuthData));
            setAuthState({ ...newAuthData, isInitialized: true });
          } catch (error) {
            console.error('Failed to refresh token on init:', error);
            localStorage.removeItem('auth_data');
            setAuthState({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isInitialized: true
            });
          }
        } else {
          setAuthState({
            ...parsedAuth,
            isAuthenticated: !!parsedAuth.token,
            isInitialized: true
          });
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          isInitialized: true
        }));
      }
    };

    initializeAuth();
  }, []);

  // Función para verificar si el token está expirado
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }, []);

  // Función para refrescar el token
  const refreshAuthToken = useCallback(async () => {
    try {
      if (!authState.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/users/token/refresh', {
        refresh: authState.refreshToken
      });
      
      const newAuthData = {
        ...authState,
        token: response.data.access,
        refreshToken: response.data.refresh || authState.refreshToken,
        isAuthenticated: true
      };
      
      localStorage.setItem('auth_data', JSON.stringify(newAuthData));
      setAuthState(newAuthData);
      
      return response.data.access;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      throw error;
    }
  }, [authState]);

  // Configurar interceptores
  useEffect(() => {
    if (!authState.isInitialized) return;

    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        // No agregar header si es una solicitud de login o refresh
        if (config.url.includes('/token') || !authState.token) {
          return config;
        }
        
        if (isTokenExpired(authState.token)) {
          try {
            const newToken = await refreshAuthToken();
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch (error) {
            console.error('Failed to refresh token in interceptor:', error);
            throw error;
          }
        } else {
          config.headers.Authorization = `Bearer ${authState.token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url.includes('/token')) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshAuthToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh token in response interceptor:', refreshError);
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [authState.token, authState.refreshToken, authState.isInitialized, isTokenExpired, refreshAuthToken]);

  // Función para guardar los datos de autenticación
  const persistAuth = useCallback((token, refreshToken, userData) => {
    const authData = {
      user: userData,
      token,
      refreshToken,
      isAuthenticated: true
    };
    localStorage.setItem('auth_data', JSON.stringify(authData));
    setAuthState({ ...authData, isInitialized: true });
  }, []);

  // Función para limpiar los datos de autenticación
  const clearPersistedAuth = useCallback(() => {
    localStorage.removeItem('auth_data');
    setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: true
    });
  }, []);

  // Función para login
  const login = useCallback((authResponse) => {
    const { access, refresh, id, username, email, role } = authResponse;
    
    const userData = {
      id,
      username,
      email,
      role
    };
    
    persistAuth(access, refresh, userData);
  }, [persistAuth]);

  // Función para logout
  const logout = useCallback(() => {
    clearPersistedAuth();
  }, [clearPersistedAuth]);

  // Sincronizar entre pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_data') {
        const authData = localStorage.getItem('auth_data');
        if (authData) {
          setAuthState({
            ...JSON.parse(authData),
            isInitialized: true,
            isAuthenticated: true
          });
        } else {
          clearPersistedAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearPersistedAuth]);

  // No renderizar hasta que la autenticación esté inicializada
  if (!authState.isInitialized) {
    return null; // O un componente de loading
  }

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      login,
      logout,
      refreshAuthToken,
      isTokenExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
};