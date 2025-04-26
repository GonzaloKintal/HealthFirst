import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Cargar estado inicial desde localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth_token') !== null;
  });

  // Función para guardar en localStorage
  const persistAuth = (userData) => {
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_token', 'mock_token'); // Puedes generar uno real si necesitas
  };

  // Función para limpiar localStorage
  const clearPersistedAuth = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  const login = (role) => {
    const userData = {
      id: 1,
      name: `Usuario ${role}`,
      email: `${role}@example.com`,
      role: role
    };
    persistAuth(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const mockLogin = (role) => {
    login(role); // Reutilizamos la función login
  };

  const logout = () => {
    clearPersistedAuth();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Sincronizar entre pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_user' || e.key === 'auth_token') {
        const user = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');
        
        if (user && token) {
          setUser(JSON.parse(user));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout,
      mockLogin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};