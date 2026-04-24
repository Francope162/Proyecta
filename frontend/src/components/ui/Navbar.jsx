import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        Proyecta<span>.</span>
      </Link>

      <div className="navbar__links">
        {user ? (
          <>
            <Link to="/dashboard" className="navbar__btn-primary">
              <span>⊞</span> Dashboard
            </Link>

            <div className="navbar__sep" />

            <div className="navbar__user" tabIndex={0}>
              <div className="navbar__avatar">{initials}</div>
              <span className="navbar__username">{user.username}</span>
              <span className="navbar__chevron">▾</span>

              <div className="navbar__dropdown">
                <Link to="/profile" className="dropdown__item">
                  <span className="dropdown__icon">◎</span> Mi perfil
                </Link>
                <Link to="/settings" className="dropdown__item">
                  <span className="dropdown__icon">⚙</span> Configuración
                </Link>
                <div className="dropdown__divider" />
                <button className="dropdown__item danger" onClick={handleLogout}>
                  <span className="dropdown__icon">→</span> Cerrar sesión
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/register" className="navbar__btn-ghost">
              Registrarse
            </Link>
            <Link to="/login" className="navbar__btn-primary">
              Iniciar sesión
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}