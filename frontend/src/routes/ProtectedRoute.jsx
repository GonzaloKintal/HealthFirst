import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  const checkAuth = () => {
    if (isAuthenticated && user) return true;
    
    const savedUser = localStorage.getItem('auth_user');
    const savedToken = localStorage.getItem('auth_token');
    
    return savedUser && savedToken;
  };

  const getCurrentUser = () => {
    return user || JSON.parse(localStorage.getItem('auth_user'));
  };

  if (!checkAuth()) {
    return <Navigate to="/login" replace />;
  }
  
  const currentUser = getCurrentUser();
  
  // Permite que allowedRoles sea un string o un array
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  if (!rolesArray.includes(currentUser?.role)) {
    return <Navigate to={`/${currentUser?.role}`} replace />;
  }
  
  return children;
};

export default ProtectedRoute;