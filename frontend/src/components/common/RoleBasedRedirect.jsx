
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

// Componente para redirección condicional
const ConditionalRedirect = ({ user }) => {
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

// Componente para redirección con efecto
const EffectRedirect = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    const routes = {
      admin: '/admin',
      supervisor: '/supervisor',
      employee: '/employee',
      analyst: '/analyst'
    };

    navigate(routes[user.role] || '/login', { replace: true });
  }, [user, navigate, location]);

  return null;
};

// Componente principal
const RoleBasedRedirect = ({ toDashboard = false }) => {
  const { user } = useAuth();
  
  return toDashboard 
    ? <EffectRedirect user={user} />
    : <ConditionalRedirect user={user} />;
};

export default RoleBasedRedirect;