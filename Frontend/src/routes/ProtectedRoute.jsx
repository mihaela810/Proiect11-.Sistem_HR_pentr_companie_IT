import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();

  // asteapta decodificarea tokenului din localStorage inainte de orice decizie
  if (loading) return null;

  // nu e logat — trimite la login
  if (!token) return <Navigate to="/login" replace />;

  // e logat dar nu are rolul necesar pentru aceasta pagina
  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}