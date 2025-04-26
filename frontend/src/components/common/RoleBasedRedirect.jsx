import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

const RoleBasedRedirect = ({ toDashboard = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirección inmediata (sin useEffect)
  if (!toDashboard) {
    const path = user ? '/dashboard' : '/login';
    return <Navigate to={path} replace />;
  }

  // Redirección con useEffect (solo cuando toDashboard es true)
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const routes = {
      admin: '/admin',
      supervisor: '/supervisor',
      employee: '/employee',
      analyst: '/analyst'
    };

    navigate(routes[user.role] || '/login');
  }, [user, navigate, location]);

  // Mientras se decide la redirección
  return null;
};

export default RoleBasedRedirect;