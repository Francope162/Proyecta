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
      // el error ya queda en el store
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Crear cuenta</h1>

        {error && (
          <div style={styles.errorBox}>
            {typeof error === 'object'
              ? Object.entries(error).map(([k, v]) => (
                  <p key={k} style={{ margin: '2px 0' }}>
                    <strong>{k}:</strong> {v}
                  </p>
                ))
              : error}
          </div>
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

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
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

          <label style={styles.label}>Repetir contraseña</label>
          <input
            style={styles.input}
            type="password"
            name="password2"
            value={form.password2}
            onChange={handleChange}
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p style={styles.footer}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={styles.link}>Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:     { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' },
  card:     { background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #e0e0e0' },
  title:    { fontSize: '22px', fontWeight: '500', marginBottom: '1.5rem' },
  form:     { display: 'flex', flexDirection: 'column', gap: '10px' },
  label:    { fontSize: '13px', color: '#666' },
  input:    { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  button:   { marginTop: '8px', padding: '10px', borderRadius: '8px', background: '#1a1a1a', color: '#fff', fontSize: '14px', cursor: 'pointer', border: 'none' },
  errorBox: { color: '#c0392b', fontSize: '13px', background: '#fdf0ed', padding: '10px', borderRadius: '8px', marginBottom: '1rem' },
  footer:   { marginTop: '1.5rem', fontSize: '13px', textAlign: 'center', color: '#666' },
  link:     { color: '#1a1a1a', fontWeight: '500' },
};