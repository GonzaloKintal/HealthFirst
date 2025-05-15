import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const checkAuth = () => {
    if (isAuthenticated && user) return true;
    
    const savedUser = localStorage.getItem('auth_user');
    const savedToken = localStorage.getItem('auth_token');
    
    return savedUser && savedToken;
  };

  if (checkAuth()) {
    // Usuario autenticado, redirigir al dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PublicRoute;