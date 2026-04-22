import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage    from './pages/BoardPage';

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    // Al recargar la página verifica si hay sesión activa
    if (localStorage.getItem('access_token')) {
      fetchMe();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/"              element={<DashboardPage />} />
          <Route path="/board/:id"     element={<BoardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}