import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  // Añadir verificación de localStorage
  const checkPersistedAuth = () => {
    const savedUser = localStorage.getItem('auth_user');
    const savedToken = localStorage.getItem('auth_token');
    
    return {
      persistedUser: savedUser ? JSON.parse(savedUser) : null,
      persistedAuth: savedToken !== null
    };
  };
  
  return {
    ...context,
    ...checkPersistedAuth() // Añade los valores persistentes
  };
};

export default useAuth;