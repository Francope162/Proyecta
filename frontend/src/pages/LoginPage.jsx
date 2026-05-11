import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [form, setForm]     = useState({ username: '', password: '' });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();
  const [hoverButton, setHoverButton] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/');
    } catch {
        
    }
  };

  return (
    <div className='auth-page'>
      <div className='auth-card'>
        <h1 className='auth-title'>Iniciar sesión</h1>

        {error && (
          <p className='auth-error'>
            {typeof error === 'string' ? error : 'Credenciales incorrectas.'}
          </p>
        )}

        <form onSubmit={handleSubmit} className='auth-form'>
          <label className='auth-label'>Usuario</label>
          <input
            className='auth-input'
            name="username"
            value={form.username}
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

          <button 
          style={{...styles.button, color: hoverButton ? '#080c10' : '#ddd', background:       hoverButton ? '#4fffb0' : '#080c10',}}
          type="submit" 
          disabled={loading}
          onMouseEnter={() => setHoverButton(true)}
          onMouseLeave={() => setHoverButton(false)}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p 
        className='auth-footer'
        >
          ¿No tenés cuenta?{' '}
          <Link className='auth-link' to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  button: { marginTop: '8px', padding: '10px', borderRadius: '8px', background: '#4fffb0', color: '#fff', fontSize: '14px', cursor: 'pointer',fontFamily: "'Syne', sans-serif", fontWeight: '700', letterSpacing: '0.04em', border: '1px solid #1e2730'  },
};