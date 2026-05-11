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

    if (loading) return <p className='loading'>Cargando tablero...</p>;
    if (!board)  return null;

    return (
    <div className='board-page'>
        <header className='board-header'>
        <button className='board-back' onClick={() => navigate('/')}>← Volver</button>
        <h1 className='board-title'>{board.name}</h1>
        </header>

        <DragDropContext onDragEnd={handleDragEnd}>
        <div className='board-columns-row'>
            {board.columns.map((col) => (
            <Column key={col.id} column={col} boardId={id} members={board.workspace_members || []} onRefresh={() => fetchBoard(id)} />
            ))}

            {/* Forms column */}
            <div className='board-new-col-box'>
            <form onSubmit={handleAddColumn} className='board-new-col-form'>
                <input
                className='board-new-col-input'
                placeholder="Nueva columna..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                />
                <button className='board-new-col-btn' type="submit" disabled={adding}>
                {adding ? '...' : '+ Agregar'}
                </button>
            </form>
            </div>
        </div>
        </DragDropContext>
    </div>
    );
}