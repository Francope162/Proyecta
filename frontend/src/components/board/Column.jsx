import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { createTask } from '../../api/boards';
import TaskCard from './TaskCard';

export default function Column({ column, boardId, members = [], onRefresh }) {
  const [form, setForm]       = useState({ title: '', priority: 'medium' });
  const [adding, setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      });
      setForm({ title: '', priority: 'medium' });
      setShowForm(false);
      onRefresh();
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={styles.column}>
      {/* Column Header */}
      <div style={styles.columnHeader}>
        <span style={styles.columnName}>{column.name}</span>
        <span style={styles.taskCount}>{column.tasks.length}</span>
      </div>

      {/* Task list */}
      <Droppable droppableId={String(column.id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              ...styles.taskList,
              background: snapshot.isDraggingOver ? '#f0f4ff' : 'transparent',
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
        <button style={styles.newTaskBtn} onClick={() => setShowForm(true)}>
          + Nueva tarea
        </button>
      )}
    </div>
  );
}

const styles = {
  column:       { minWidth: '260px', maxWidth: '260px', background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  columnName:   { fontSize: '14px', fontWeight: '500' },
  taskCount:    { fontSize: '12px', background: '#f0f0f0', borderRadius: '20px', padding: '2px 8px', color: '#666' },
  taskList:     { display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '40px', borderRadius: '8px', transition: 'background 0.15s', padding: '4px' },
  taskForm:     { display: 'flex', flexDirection: 'column', gap: '8px' },
  taskInput:    { padding: '8px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' },
  formButtons:  { display: 'flex', gap: '8px' },
  addBtn:       { flex: 1, padding: '7px', borderRadius: '8px', background: '#1a1a1a', color: '#fff', fontSize: '13px', cursor: 'pointer', border: 'none' },
  cancelBtn:    { flex: 1, padding: '7px', borderRadius: '8px', background: '#fff', color: '#666', fontSize: '13px', cursor: 'pointer', border: '1px solid #ddd' },
  newTaskBtn:   { padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px dashed #ddd', color: '#999', fontSize: '13px', cursor: 'pointer', textAlign: 'left' },
};