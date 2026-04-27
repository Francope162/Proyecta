import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getWorkspaces, createWorkspace } from '../api/workspaces';
import InvitationsInbox from '../components/ui/InvitationsInbox';

export default function DashboardPage() {
  const { user, logout }            = useAuthStore();
  const navigate                    = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [form, setForm]             = useState({ name: '', slug: '' });
  const [loading, setLoading]       = useState(false);
  const [creating, setCreating]     = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await getWorkspaces();
      setWorkspaces(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createWorkspace(form);
      setForm({ name: '', slug: '' });
      loadData();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={s.page}>
      {/* fondo partículas */}
      <div style={s.grid} />

      <div style={s.container}>
        {/* Header */}
        <InvitationsInbox onActionSuccess={loadData}/>
        <div style={s.header}>
          <div>
            <div style={s.tag}>// Tus espacios</div>
            <h1 style={s.title}>Workspaces</h1>
          </div>
          <button style={s.btnGhost} onClick={() => setCreating(c => !c)}>
            {creating ? '✕ Cancelar' : '+ Nuevo workspace'}
          </button>
        </div>

        {/* Form crear */}
        {creating && (
          <form onSubmit={handleCreate} style={s.createForm}>
            <input
              style={s.input}
              placeholder="Nombre del workspace"
              value={form.name}
              onChange={(e) => setForm({
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
              })}
              required
              autoFocus
            />
            <button style={s.btnPrimary} type="submit" disabled={creating}>
              Crear
            </button>
          </form>
        )}

        {/* Grid de workspaces */}
        {loading ? (
          <p style={s.empty}>Cargando...</p>
        ) : workspaces.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyIcon}>⊞</p>
            <p style={s.emptyTitle}>No tenés workspaces todavía</p>
            <p style={s.emptyDesc}>Creá uno para empezar a organizar tus proyectos.</p>
          </div>
        ) : (
          <div style={s.grid2}>
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                style={s.card}
                onClick={() => navigate(`/workspace/${ws.id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#4fffb0';
                  e.currentTarget.style.background  = '#151d26';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e2730';
                  e.currentTarget.style.background  = '#0d1117';
                }}
              >
                <div style={s.cardTop}>
                  <div style={s.cardIcon}>
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={s.cardArrow}>→</div>
                </div>
                <div style={s.cardName}>{ws.name}</div>
                <div style={s.cardMeta}>
                  <span style={s.cardTag}>
                    {ws.members?.length || 1} miembro{ws.members?.length !== 1 ? 's' : ''}
                  </span>
                  <span style={s.cardTag}>
                    {ws.boards?.length || 0} tablero{ws.boards?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', background: '#080c10', paddingTop: '62px', fontFamily: "'DM Mono', monospace" },
  grid:       { position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(#1e2730 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4, pointerEvents: 'none' },
  container:  { maxWidth: '960px', margin: '0 auto', padding: '3rem 2rem' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' },
  tag:        { fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4fffb0', marginBottom: '0.4rem' },
  title:      { fontFamily: "'Syne', sans-serif", fontSize: '2.5rem', fontWeight: 800, color: '#e8edf2', letterSpacing: '-0.03em', margin: 0 },
  btnGhost:   { background: 'transparent', border: '1px solid rgba(79,255,176,0.3)', color: '#4fffb0', padding: '0.5rem 1.2rem', borderRadius: '3px', fontSize: '0.78rem', cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.2s' },
  btnPrimary: { background: '#4fffb0', color: '#080c10', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '3px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  createForm: { display: 'flex', gap: '10px', marginBottom: '2rem', background: '#0d1117', border: '1px solid #1e2730', borderRadius: '6px', padding: '1rem' },
  input:      { flex: 1, background: '#080c10', border: '1px solid #1e2730', borderRadius: '4px', color: '#e8edf2', padding: '0.55rem 0.9rem', fontSize: '0.82rem', fontFamily: "'DM Mono', monospace", outline: 'none' },
  grid2:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: '#1e2730' },
  card:       { background: '#0d1117', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #1e2730' },
  cardTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  cardIcon:   { width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(79,255,176,0.15), rgba(0,200,255,0.15))', border: '1px solid rgba(79,255,176,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.85rem', color: '#4fffb0' },
  cardArrow:  { color: '#1e2730', fontSize: '1rem', transition: 'color 0.2s' },
  cardName:   { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#e8edf2', marginBottom: '0.8rem' },
  cardMeta:   { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  cardTag:    { fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2730', color: '#5a6a7a', padding: '0.2rem 0.6rem', borderRadius: '2px' },
  emptyState: { textAlign: 'center', padding: '5rem 2rem' },
  emptyIcon:  { fontSize: '3rem', marginBottom: '1rem', color: '#1e2730' },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#e8edf2', marginBottom: '0.5rem' },
  emptyDesc:  { fontSize: '0.8rem', color: '#5a6a7a' },
  empty:      { color: '#5a6a7a', fontSize: '0.82rem', textAlign: 'center', padding: '3rem' },
};