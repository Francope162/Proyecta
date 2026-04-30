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
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Iniciar sesión</h1>

        {error && (
          <p style={styles.error}>
            {typeof error === 'string' ? error : 'Credenciales incorrectas.'}
          </p>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Usuario</label>
          <input
            style={styles.input}
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Contraseña</label>
          <input
            style={styles.input}
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
        style={{...styles.footer,  }}
        >
          ¿No tenés cuenta?{' '}
          <Link to="/register" style={styles.link}>Registrate</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:   { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#080c10' },
  card:   { background: '#080c10', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #1e2730', color: '#4fffb0', fontFamily: "'Syne', sans-serif" },
  title:  { fontSize: '22px', fontWeight: '500', marginBottom: '1.5rem' },
  form:   { display: 'flex', flexDirection: 'column', gap: '10px' },
  label:  { fontSize: '13px', color: '#888', fontFamily: "'DM Mono', monospace", },
  input:  { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: "'DM Mono', monospace", background: '#080c10', color: '#ddd',  },
  button: { marginTop: '8px', padding: '10px', borderRadius: '8px', background: '#4fffb0', color: '#fff', fontSize: '14px', cursor: 'pointer',fontFamily: "'Syne', sans-serif", fontWeight: '700', letterSpacing: '0.04em', border: '1px solid #1e2730'  },
  error:  { color: '#c0392b', fontSize: '13px', background: '#fdf0ed', padding: '10px', borderRadius: '8px' },
  footer: { marginTop: '1.5rem', fontSize: '13px', textAlign: 'center', color: '#666' },
  link:   { color: '#4fffb0', fontWeight: '500' },
};