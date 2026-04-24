import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getWorkspaces, createWorkspace } from '../api/workspaces';
import { getBoards, createBoard } from '../api/boards';

export default function DashboardPage() {
  const { user, logout }              = useAuthStore();
  const navigate                      = useNavigate();
  const [workspaces, setWorkspaces]   = useState([]);
  const [boards, setBoards]           = useState([]);
  const [wsForm, setWsForm]           = useState({ name: '', slug: '' });
  const [boardForm, setBoardForm]     = useState({ name: '', workspace: '' });
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [ws, bs] = await Promise.all([getWorkspaces(), getBoards()]);
    setWorkspaces(ws.data);
    setBoards(bs.data);
    if (ws.data.length > 0) {
      setBoardForm((f) => ({ ...f, workspace: ws.data[0].id }));
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createWorkspace(wsForm);
      setWsForm({ name: '', slug: '' });
      loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBoard(boardForm);
      setBoardForm((f) => ({ ...f, name: '' }));
      loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.page}>

      <main style={styles.main}>

        {/* Workspaces */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Workspaces</h2>
          <form onSubmit={handleCreateWorkspace} style={styles.inlineForm}>
            <input
              style={styles.input}
              placeholder="Nombre"
              value={wsForm.name}
              onChange={(e) => setWsForm({ ...wsForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              required
            />
            <button style={styles.addBtn} type="submit" disabled={loading}>
              + Crear
            </button>
          </form>
          <div style={styles.grid}>
            {workspaces.map((ws) => (
              <div key={ws.id} style={styles.card}>
                <p style={styles.cardTitle}>{ws.name}</p>
                <p style={styles.cardSub}>{ws.members?.length} miembro(s)</p>
              </div>
            ))}
          </div>
        </section>

        {/* Boards */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Tableros</h2>
          <form onSubmit={handleCreateBoard} style={styles.inlineForm}>
            <input
              style={styles.input}
              placeholder="Nombre del tablero"
              value={boardForm.name}
              onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
              required
            />
            <select
              style={styles.input}
              value={boardForm.workspace}
              onChange={(e) => setBoardForm({ ...boardForm, workspace: e.target.value })}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
            <button style={styles.addBtn} type="submit" disabled={loading}>
              + Crear
            </button>
          </form>
          <div style={styles.grid}>
            {boards.map((board) => (
              <div
                key={board.id}
                style={{ ...styles.card, cursor: 'pointer' }}
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <p style={styles.cardTitle}>{board.name}</p>
                <p style={styles.cardSub}>{board.columns?.length} columna(s)</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

const styles = {
  page:         { minHeight: '100vh', background: '#f5f5f5' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #e0e0e0' },
  logo:         { fontSize: '18px', fontWeight: '500', margin: 0 },
  userRow:      { display: 'flex', alignItems: 'center', gap: '12px' },
  username:     { fontSize: '14px', color: '#666' },
  logoutBtn:    { fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  main:         { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  section:      { marginBottom: '2.5rem' },
  sectionTitle: { fontSize: '16px', fontWeight: '500', marginBottom: '1rem' },
  inlineForm:   { display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' },
  input:        { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', flex: 1, minWidth: '160px' },
  addBtn:       { padding: '8px 16px', borderRadius: '8px', background: '#1a1a1a', color: '#fff', fontSize: '14px', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  card:         { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1rem 1.25rem' },
  cardTitle:    { fontSize: '14px', fontWeight: '500', margin: '0 0 4px' },
  cardSub:      { fontSize: '12px', color: '#999', margin: 0 },
};