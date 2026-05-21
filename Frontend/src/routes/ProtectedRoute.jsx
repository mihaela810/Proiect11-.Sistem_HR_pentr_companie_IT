import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();

  if (loading) return null;
  if (!token)  return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
