import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { createTask, deleteColumn, updateColumn } from '../../api/boards';
import TaskCard from './TaskCard';

export default function Column({ column, boardId, members = [], onRefresh }) {
  const [form, setForm]       = useState({ title: '', priority: 'medium' });
  const [formC, setFormC] = useState({name: column.name});
  const [adding, setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hoverNewTask, setHoverNewTask] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta columna?')) return;
    await deleteColumn(column.id);
    onRefresh();
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateColumn(column.id, {
        name:        form.name,
      });
      setEditing(false);
      onRefresh();
    } catch (err) {
      console.error('Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setForm({ ...form, assignee_ids: selected });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      await createTask({
        column:   column.id,
        title:    form.title,
        priority: form.priority,
        order:    column.tasks.length,
        assignee_ids: Array.isArray(form.assignee_ids)  // ← forzar array siempre
                ? form.assignee_ids
                : [form.assignee_ids].filter(Boolean),
      });
      setForm({ title: '', priority: 'medium' });
      setShowForm(false);
      onRefresh();
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className='column'>
      {editing ?
        (
        <form onSubmit={handleSave} style={styles.editForm}>
          <input
            style={styles.editInput}
            value={formC.name}
            onChange={(e) => setForm({ ...formC, name: e.target.value })}
            required
            autoFocus
          />
          <div style={styles.editButtons}>
            <button style={styles.saveBtn} type="submit" disabled={loading}>
              {loading ? '...' : 'Guardar'}
            </button>
            <button style={styles.cancelBtn} type="button" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </div>
        </form>
        ):
        (
        <div className='column-header'>
          <span className='column-name'>{column.name}</span>
          <span style={styles.taskCount}>{column.tasks.length}</span>
          <div style={styles.columnActions}>
            <button style={styles.actionBtn} onClick={() => setEditing(true)}>✎</button>
            <button style={{ ...styles.actionBtn, color: '#c0392b' }} onClick={()=>handleDelete()}>✕</button>
          </div>
        </div>
        )
      }

      {/* Task list */}
      <Droppable droppableId={String(column.id)}>
        {(provided, snapshot) => (
          <div
            className='column-task-list'
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              background: snapshot.isDraggingOver ? '#0d1117' : 'transparent',
            }}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                members={members}
                onRefresh={onRefresh}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task */}
      {showForm ? (
        <form onSubmit={handleAddTask} style={styles.taskForm}>
          <input
            style={styles.taskInput}
            placeholder="Título de la tarea"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            autoFocus
            required
          />
          <select
            style={styles.taskInput}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
          <label style={styles.assignLabel}>
            Asignados (Ctrl + clic para varios)
          </label>
          <select
            multiple
            style={{ ...styles.editInput, height: '90px' }}
            value={form.assignee_ids}
            onChange={handleAssigneeChange}
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.username}
              </option>
            ))}
          </select>
          <input
            style={styles.taskInput}
            type="date" 
            placeholder='Fecha de vencimiento'
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <div style={styles.formButtons}>
            <button style={styles.addBtn} type="submit" disabled={adding}>
              {adding ? '...' : 'Agregar'}
            </button>
            <button
              style={styles.cancelBtn}
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button style={{...styles.newTaskBtn, borderColor: hoverNewTask ? '#4fffb0' : '#1e2730', color:       hoverNewTask ? '#4fffb0' : '#5a6a7a',}} onClick={() => setShowForm(true)}   onMouseEnter={() => setHoverNewTask(true)}
  onMouseLeave={() => setHoverNewTask(false)}>
          + Nueva tarea
        </button>
      )}
    </div>
  );
}

const styles = {
  column:       { minWidth: '260px', maxWidth: '260px', background: '#0d1117', borderRadius: '6px', border: '1px solid #1e2730', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: "'DM Mono', monospace" },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  columnName:   { fontSize: '0.78rem', fontWeight: '700', color: '#4fffb0', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Syne', sans-serif" },
  taskCount:    { fontSize: '0.68rem', background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2730', borderRadius: '20px', padding: '2px 8px', color: '#5a6a7a', letterSpacing: '0.06em' },
  taskList:     { display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '40px', borderRadius: '4px', transition: 'background 0.15s', padding: '4px' },
  taskForm:     { display: 'flex', flexDirection: 'column', gap: '8px' },
  taskInput:    { padding: '8px 10px', borderRadius: '4px', border: '1px solid #1e2730', fontSize: '0.78rem', background: '#080c10', color: '#e8edf2', fontFamily: "'DM Mono', monospace", outline: 'none' },
  assignLabel:   { fontSize: '11px', color: '#ddd', marginTop: '4px' },
  formButtons:  { display: 'flex', gap: '8px' },
  addBtn:       { flex: 1, padding: '7px', borderRadius: '3px', background: '#4fffb0', color: '#080c10', fontSize: '0.75rem', cursor: 'pointer', border: 'none', fontFamily: "'Syne', sans-serif", fontWeight: '700', letterSpacing: '0.04em' },
  cancelBtn:    { flex: 1, padding: '7px', borderRadius: '3px', background: 'transparent', color: '#5a6a7a', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid #1e2730' },
  newTaskBtn:   { padding: '8px', borderRadius: '3px', background: 'transparent', border: '1px dashed #1e2730', color: '#5a6a7a', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s, color 0.2s' },
  editForm:      { display: 'flex', flexDirection: 'column', gap: '8px' },
  editInput:     { padding: '7px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', width: '100%', boxSizing: 'border-box', background: '#080c10', color: '#ddd',  fontFamily: "'DM Mono', monospace", },
  editButtons:   { display: 'flex', gap: '8px' },
  actionBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px 4px', color: '#333' },
  columnActions:   { display: 'flex', gap: '4px', opacity: 0.4, transition: 'opacity 0.15s' },
  saveBtn:       { flex: 1, padding: '7px', borderRadius: '8px', background: '#4fffb0', color: '#080c10', fontSize: '13px', cursor: 'pointer', border: 'none', fontFamily: "'Syne', sans-serif", fontWeight: '700', letterSpacing: '0.04em' },
  cancelBtn:     { flex: 1, padding: '7px', borderRadius: '8px', background: '#0d1117', color: '#ddd', fontSize: '13px', cursor: 'pointer', border: '1px solid #ddd', fontFamily: "'Syne', sans-serif", fontWeight: '700', letterSpacing: '0.04em' },
};