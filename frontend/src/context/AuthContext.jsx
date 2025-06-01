import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado inicial cargado desde localStorage
  const [authState, setAuthState] = useState(() => {
    const savedAuth = localStorage.getItem('auth_data');
    return savedAuth 
      ? JSON.parse(savedAuth) 
      : { user: null, token: null, refreshToken: null, isAuthenticated: false };
  });

  // Función para persistir los datos de autenticación
  const persistAuth = (token, refreshToken, userData) => {
    const authData = {
      user: userData,
      token,
      refreshToken,
      isAuthenticated: true
    };
    localStorage.setItem('auth_data', JSON.stringify(authData));
    setAuthState(authData);
  };

  // Función para limpiar la autenticación
  const clearPersistedAuth = () => {
    localStorage.removeItem('auth_data');
    setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false
    });
  };

  // Función de login real
  const login = (authResponse) => {
    const { access, refresh, id, username, email, role } = authResponse;
    
    const userData = {
      id,
      username,
      email,
      role
    };
    
    persistAuth(access, refresh, userData);
  };

  // Función de logout
  const logout = () => {
    clearPersistedAuth();
    // Opcional: llamar a endpoint de logout en el backend si es necesario
  };

  // Sincronización entre pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_data') {
        const authData = localStorage.getItem('auth_data');
        if (authData) {
          setAuthState(JSON.parse(authData));
        } else {
          clearPersistedAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user: authState.user,
      token: authState.token,
      refreshToken: authState.refreshToken,
      isAuthenticated: authState.isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};