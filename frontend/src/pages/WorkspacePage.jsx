import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkspace, createWorkspace } from '../api/workspaces';
import { getBoards, createBoard } from '../api/boards';
import UserSearch from '../components/ui/UserSearch';

export default function WorkspacePage() {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const [workspace, setWs]      = useState(null);
  const [boards, setBoards]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [boardName, setBoardName] = useState('');

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wsRes, bRes] = await Promise.all([
        getWorkspace(id),
        getBoards(),
      ]);
      setWs(wsRes.data);
      // filtrar boards de este workspace
      setBoards(bRes.data.filter(b => b.workspace === id || b.workspace?.id === id));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      await createBoard({ workspace: id, name: boardName });
      setBoardName('');
      setCreating(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={s.loading}>Cargando workspace...</div>;
  if (!workspace) return null;

  const members = workspace.members || [];

  return (
    <div style={s.page}>
      <div style={s.gridBg} />

      <div style={s.container}>

        {/* Breadcrumb */}
        <div style={s.breadcrumb}>
          <span style={s.breadcrumbLink} onClick={() => navigate('/dashboard')}>Workspaces</span>
          <span style={s.breadcrumbSep}>/</span>
          <span style={s.breadcrumbCurrent}>{workspace.name}</span>
        </div>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.tag}>// Workspace</div>
            <h1 style={s.title}>{workspace.name}</h1>
          </div>
          <button style={s.btnGhost} onClick={() => setCreating(c => !c)}>
            {creating ? '✕ Cancelar' : '+ Nuevo tablero'}
          </button>
        </div>

        {/* Barra de miembros */}
        <div style={s.membersBar}>
          <div style={s.membersLeft}>
            <span style={s.membersLabel}>// Miembros</span>
            <span style={s.membersCount}>
              {members.length} miembro{members.length !== 1 ? 's' : ''}
            </span>
            {workspace.pending_invitations.map(invite => (
            <div key={invite.id} style={{ opacity: 0.6 }}>
                {invite.email} (Esperando respuesta...)
            </div>
            ))}
          </div>
          
          <div style={s.membersRight}>
            {members.map((m) => (
              <div key={m.user?.id} style={s.memberChip}>
                <div style={s.chipAvatar}>
                  {m.user?.avatar_url ? (<img style={s.avatarImg} src={m.user?.avatar_url} alt={m.user?.username} />):((m.user?.username || '?').slice(0, 2).toUpperCase())}
                </div>
                <div>
                  <div style={s.chipName}>{m.user?.username}</div>
                  <div style={s.chipRole}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*Add member */}
        <div style={s.membersBar}>
            <UserSearch  workspaceId={id} 
      onUserAdded={loadData}/>
        </div>

        {/* Form crear tablero */}
        {creating && (
          <form onSubmit={handleCreateBoard} style={s.createForm}>
            <input
              style={s.input}
              placeholder="Nombre del tablero"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              required
              autoFocus
            />
            <button style={s.btnPrimary} type="submit">
              Crear tablero
            </button>
          </form>
        )}

        {/* Divisor */}
        <div style={s.divider}>
          <span style={s.tag}>// Tableros</span>
        </div>

        {/* Grid de boards */}
        {boards.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyIcon}>▦</p>
            <p style={s.emptyTitle}>No hay tableros todavía</p>
            <p style={s.emptyDesc}>Creá el primer tablero para este workspace.</p>
          </div>
        ) : (
          <div style={s.boardsGrid}>
            {boards.map((board) => (
              <div
                key={board.id}
                style={s.boardCard}
                onClick={() => navigate(`/board/${board.id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#4fffb0';
                  e.currentTarget.style.background  = '#151d26';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e2730';
                  e.currentTarget.style.background  = '#0d1117';
                }}
              >
                <div style={s.boardTop}>
                  <div style={s.boardIcon}>▦</div>
                  <span style={s.boardArrow}>→</span>
                </div>
                <div style={s.boardName}>{board.name}</div>
                {board.description && (
                  <div style={s.boardDesc}>{board.description}</div>
                )}
                <div style={s.boardMeta}>
                  <span style={s.cardTag}>
                    {board.columns?.length || 0} columna{board.columns?.length !== 1 ? 's' : ''}
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
  page:           { minHeight: '100vh', background: '#080c10', paddingTop: '62px', fontFamily: "'DM Mono', monospace" },
  gridBg:         { position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(#1e2730 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4, pointerEvents: 'none' },
  loading:        { color: '#5a6a7a', fontSize: '0.82rem', textAlign: 'center', padding: '5rem', fontFamily: "'DM Mono', monospace" },
  container:      { maxWidth: '960px', margin: '0 auto', padding: '2.5rem 2rem' },
  breadcrumb:     { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.75rem' },
  breadcrumbLink: { color: '#4fffb0', cursor: 'pointer', letterSpacing: '0.04em' },
  breadcrumbSep:  { color: '#1e2730' },
  breadcrumbCurrent: { color: '#5a6a7a' },
  header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' },
  tag:            { fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4fffb0', marginBottom: '0.4rem' },
  title:          { fontFamily: "'Syne', sans-serif", fontSize: '2.2rem', fontWeight: 800, color: '#e8edf2', letterSpacing: '-0.03em', margin: 0 },
  btnGhost:       { background: 'transparent', border: '1px solid rgba(79,255,176,0.3)', color: '#4fffb0', padding: '0.5rem 1.2rem', borderRadius: '3px', fontSize: '0.78rem', cursor: 'pointer', letterSpacing: '0.04em' },
  btnPrimary:     { background: '#4fffb0', color: '#080c10', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '3px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  createForm:     { display: 'flex', gap: '10px', marginBottom: '2rem', background: '#0d1117', border: '1px solid #1e2730', borderRadius: '6px', padding: '1rem' },
  input:          { flex: 1, background: '#080c10', border: '1px solid #1e2730', borderRadius: '4px', color: '#e8edf2', padding: '0.55rem 0.9rem', fontSize: '0.82rem', fontFamily: "'DM Mono', monospace", outline: 'none' },

  // Barra miembros
  membersBar:     { background: '#0d1117', border: '1px solid #1e2730', borderRadius: '8px', padding: '1.2rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  membersLeft:    { display: 'flex', alignItems: 'center', gap: '1rem' },
  membersLabel:   { fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4fffb0' },
  avatarRow:      { display: 'flex', alignItems: 'center' },
  avatar:         { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #4fffb0, #00c8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.65rem', color: '#080c10', border: '2px solid #080c10', cursor: 'default' },
  membersCount:   { fontSize: '0.75rem', color: '#5a6a7a' },
  membersRight:   { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  memberChip:     { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#111820', border: '1px solid #1e2730', borderRadius: '20px', padding: '0.3rem 0.8rem 0.3rem 0.3rem' },
  chipAvatar:     { width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(79,255,176,0.3), rgba(0,200,255,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 700, color: '#4fffb0' },
  chipName:       { fontSize: '0.72rem', color: '#e8edf2', letterSpacing: '0.02em' },
  chipRole:       { fontSize: '0.62rem', color: '#5a6a7a', letterSpacing: '0.06em', textTransform: 'uppercase' },
  avatarImg:         { width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #080c10', display: 'block' },

  divider:        { marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid #1e2730' },

  // Boards
  boardsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: '#1e2730' },
  boardCard:      { background: '#0d1117', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #1e2730' },
  boardTop:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  boardIcon:      { fontSize: '1.5rem', color: '#4fffb0' },
  boardArrow:     { color: '#1e2730', fontSize: '1rem' },
  boardName:      { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#e8edf2', marginBottom: '0.5rem' },
  boardDesc:      { fontSize: '0.75rem', color: '#5a6a7a', marginBottom: '0.8rem', lineHeight: 1.6 },
  boardMeta:      { display: 'flex', gap: '0.5rem' },
  cardTag:        { fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2730', color: '#5a6a7a', padding: '0.2rem 0.6rem', borderRadius: '2px' },
  emptyState:     { textAlign: 'center', padding: '4rem 2rem' },
  emptyIcon:      { fontSize: '2.5rem', marginBottom: '1rem', color: '#1e2730' },
  emptyTitle:     { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#e8edf2', marginBottom: '0.5rem' },
  emptyDesc:      { fontSize: '0.78rem', color: '#5a6a7a' },
};