import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import useBoardStore from '../store/boardStore';
import { createColumn } from '../api/boards';
import Column from '../components/board/Column';

export default function BoardPage() {
    const { id }                      = useParams();
    const navigate                    = useNavigate();
    const { board, loading, fetchBoard, moveTask } = useBoardStore();
    const [newColName, setNewColName] = useState('');
    const [adding, setAdding]         = useState(false);

    useEffect(() => {
    fetchBoard(id);
    }, [id]);

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        await moveTask(
            draggableId,
            source.droppableId,     
            destination.droppableId, 
            destination.index       
        );
    };

    const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setAdding(true);
    try {
        await createColumn({
        board: id,
        name: newColName,
        order: board.columns.length,
        });
        setNewColName('');
        fetchBoard(id);
    } finally {
        setAdding(false);
    }
    };

    if (loading) return <p style={styles.loading}>Cargando tablero...</p>;
    if (!board)  return null;

    return (
    <div style={styles.page}>
        <header style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/')}>← Volver</button>
        <h1 style={styles.title}>{board.name}</h1>
        </header>

        <DragDropContext onDragEnd={handleDragEnd}>
        <div style={styles.columnsRow}>
            {board.columns.map((col) => (
            <Column key={col.id} column={col} boardId={id} onRefresh={() => fetchBoard(id)} />
            ))}

            {/* Forms column */}
            <div style={styles.newColBox}>
            <form onSubmit={handleAddColumn} style={styles.newColForm}>
                <input
                style={styles.newColInput}
                placeholder="Nueva columna..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                />
                <button style={styles.newColBtn} type="submit" disabled={adding}>
                {adding ? '...' : '+ Agregar'}
                </button>
            </form>
            </div>
        </div>
        </DragDropContext>
    </div>
    );
}

const styles = {
  page:       { minHeight: '100vh', background: '#f0f2f5' },
  header:     { display: 'flex', alignItems: 'center', gap: '16px', padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #e0e0e0' },
  back:       { fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  title:      { fontSize: '18px', fontWeight: '500', margin: 0 },
  columnsRow: { display: 'flex', gap: '14px', padding: '1.5rem', overflowX: 'auto', alignItems: 'flex-start', minHeight: 'calc(100vh - 65px)' },
  newColBox:  { minWidth: '260px', background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '1rem' },
  newColForm: { display: 'flex', flexDirection: 'column', gap: '8px' },
  newColInput:{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  newColBtn:  { padding: '8px', borderRadius: '8px', background: '#1a1a1a', color: '#fff', fontSize: '13px', cursor: 'pointer', border: 'none' },
  loading:    { padding: '2rem', textAlign: 'center', color: '#999' },
};