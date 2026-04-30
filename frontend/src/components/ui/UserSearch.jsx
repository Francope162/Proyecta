import React, { useState } from 'react';
import axios from 'axios';
import { inviteMember } from '../../api/workspaces';
import { data } from 'react-router-dom';

const UserSearch = ({ workspaceId, onUserAdded }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Llamamos a la acción 'invite' que creamos en Django
      const response = await inviteMember(workspaceId, { email, role: 'member' });

      alert('Usuario invitado con éxito');
      setEmail(''); // Limpiamos el input
      if (onUserAdded) onUserAdded(response.data);
    } catch (err) {
      // Capturamos el error que configuramos en el Serializer (ej: "Usuario ya es miembro")
      setError(err.response?.data?.detail || 'Error al invitar al usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-container">
      <h3>Invitar Miembro</h3>
      <form onSubmit={handleInvite} style={s.inviteForm}>
        <input
          style={s.input}
          type="email"
          placeholder="nombre@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button style={s.btnPrimary} type="submit" disabled={loading}>
          {loading ? 'Invitando...' : 'Invitar'}
        </button>
      </form>
      
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default UserSearch;

const s = {
  inviteForm:     { display: 'flex', gap: '10px', background: '#0d1117', border: '1px solid #1e2730', borderRadius: '6px', padding: '1rem' },
  input:          { flex: 1, background: '#080c10', border: '1px solid #1e2730', borderRadius: '4px', color: '#e8edf2', padding: '0.55rem 0.9rem', fontSize: '0.82rem', fontFamily: "'DM Mono', monospace", outline: 'none' },
  btnPrimary:     { background: '#4fffb0', color: '#080c10', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '3px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' },
}