import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useRequireAuth(requiredRole = null) {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        navigate('/login');
      } else if (requiredRole && auth.user?.role !== requiredRole) {
        navigate('/');
      }
    }
  }, [auth.loading, auth.isAuthenticated, auth.user, requiredRole, navigate]);

  return auth;
}
