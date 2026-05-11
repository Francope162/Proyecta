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
    <div className='dashboard-page'>
      {/* fondo partículas */}
      <div className='dashboard-grid'/>

      <div className='dashboard-container'>
        {/* Header */}
        <InvitationsInbox onActionSuccess={loadData}/>
        <div className='dashboard-header'>
          <div>
            <div className='dashboard-tag'>// Tus espacios</div>
            <h1 className='dashboard-title'>Workspaces</h1>
          </div>
          <button className='dashboard-btn-ghost' onClick={() => setCreating(c => !c)}>
            {creating ? '✕ Cancelar' : '+ Nuevo workspace'}
          </button>
        </div>

        {/* Form crear */}
        {creating && (
          <form onSubmit={handleCreate} className='dashboard-create-form'>
            <input
              className='dashboard-input'
              placeholder="Nombre del workspace"
              value={form.name}
              onChange={(e) => setForm({
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
              })}
              required
              autoFocus
            />
            <button className='dashboard-btn-primary' type="submit" disabled={creating}>
              Crear
            </button>
          </form>
        )}

        {/* Grid de workspaces */}
        {loading ? (
          <p className='dashboard-empty'>Cargando...</p>
        ) : workspaces.length === 0 ? (
          <div className='dashboard-empty-state'>
            <p className='dashboard-empty-icon'>⊞</p>
            <p className='dashboard-empty-title'>No tenés workspaces todavía</p>
            <p className='dashboard-empty-desc'>Creá uno para empezar a organizar tus proyectos.</p>
          </div>
        ) : (
          <div style={s.grid2}>
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className='dashboard-card'
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
                <div className='dashboard-card-top'>
                  <div className='dashboard-card-icon' style={s.cardIcon}>
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className='dashboard-card-arrow'>→</div>
                </div>
                <div className='dashboard-card-name'>{ws.name}</div>
                <div className='dashboard-card-meta'>
                  <span className='dashboard-card-tag'>
                    {ws.members?.length || 1} miembro{ws.members?.length !== 1 ? 's' : ''}
                  </span>
                  <span className='dashboard-card-tag'>
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
  
  grid2:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: '#1e2730' },
}