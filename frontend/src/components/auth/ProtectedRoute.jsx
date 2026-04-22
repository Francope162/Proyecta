import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const token = localStorage.getItem('access_token');

  if (!token && !user) return <Navigate to="/login" replace />;
  return <Outlet />;
}