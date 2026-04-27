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
      <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="email"
          placeholder="nombre@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '8px', flex: 1 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Invitando...' : 'Invitar'}
        </button>
      </form>
      
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default UserSearch;