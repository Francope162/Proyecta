import React, { useEffect, useState } from 'react';
import { getMyInvitations, acceptInvitation, declineInvitation } from '../../api/workspaces';

export default function InvitationsInbox({ onActionSuccess }) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInvites = async () => {
    try {
      const res = await getMyInvitations();
      setInvites(res.data);
    } catch (err) {
      console.error("Error cargando invitaciones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvites(); }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'accept') {
        await acceptInvitation(id);
        alert("¡Te has unido al workspace!");
      } else {
        await declineInvitation(id);
      }
      // Refrescamos la lista local y avisamos al padre (para recargar los workspaces)
      loadInvites();
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      alert("Error al procesar la invitación");
    }
  };

  if (loading) return null;
  if (invites.length === 0) return null; // No mostramos nada si no hay pendientes

  return (
    <div style={s.inboxContainer}>
      <h3 style={s.inboxTitle}>// Invitaciones Pendientes ({invites.length})</h3>
      <div style={s.list}>
        {invites.map(invite => (
          <div key={invite.id} style={s.inviteCard}>
            <div>
              <p style={s.inviteText}>
                <strong>{invite.invited_by_name}</strong> te invitó a 
                <span style={s.workspaceName}> {invite.workspace_name}</span>
              </p>
              <span style={s.roleTag}>{invite.role}</span>
            </div>
            <div style={s.actions}>
              <button onClick={() => handleAction(invite.id, 'accept')} style={s.btnAccept}>
                Aceptar
              </button>
              <button onClick={() => handleAction(invite.id, 'decline')} style={s.btnDecline}>
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  inboxContainer: { background: '#0d1117', border: '1px solid #1e2730', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' },
  inboxTitle: { color: '#4fffb0', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1rem' },
  inviteCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#080c10', border: '1px solid #1e2730', borderRadius: '6px', marginBottom: '0.5rem' },
  inviteText: { color: '#e8edf2', fontSize: '0.9rem', margin: 0 },
  workspaceName: { color: '#4fffb0', fontWeight: 'bold' },
  roleTag: { fontSize: '0.65rem', color: '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.05em' },
  actions: { display: 'flex', gap: '10px' },
  btnAccept: { background: '#4fffb0', color: '#080c10', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  btnDecline: { background: 'transparent', color: '#ff5555', border: '1px solid #ff5555', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }
};