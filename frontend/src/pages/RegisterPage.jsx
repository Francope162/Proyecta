import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: ''
  });
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/login');
    } catch {
        
    }
  };

  return (
    <div className='auth-page'>
      <div className='auth-card'>
        <h1 className='auth-title'>Crear cuenta</h1>

        {error && (
          <div className='auth-error-box'>
            {typeof error === 'object'
              ? Object.entries(error).map(([k, v]) => (
                  <p key={k} style={{ margin: '2px 0' }}>
                    <strong>{k}:</strong> {v}
                  </p>
                ))
              : error}
          </div>
        )}

        <form className='auth-form' onSubmit={handleSubmit}>
          <label className='auth-label'>Usuario</label>
          <input
            className='auth-input'
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label className='auth-label'>Email</label>
          <input
            className='auth-input'
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label className='auth-label'>Contraseña</label>
          <input
            className='auth-input'
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className='auth-label'>Repetir contraseña</label>
          <input
            className='auth-input'
            type="password"
            name="password2"
            value={form.password2}
            onChange={handleChange}
            required
          />

          <button className='auth-button' type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className='auth-footer'>
          ¿Ya tenés cuenta?{' '}
          <Link className='auth-link' to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}