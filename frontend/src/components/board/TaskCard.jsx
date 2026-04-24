import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { updateTask, deleteTask } from '../../api/boards';

const priorityColors = {
  low:    { bg: '#f0fdf4', text: '#166534', label: 'Baja' },
  medium: { bg: '#fffbeb', text: '#92400e', label: 'Media' },
  high:   { bg: '#fef2f2', text: '#991b1b', label: 'Alta' },
};

export default function TaskCard({ task, index, members = [], onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({
    title:        task.title,
    description:  task.description || '',
    priority:     task.priority,
    assignee_ids: task.assignees?.map(a => String(a.user.id)) || [], // ← era undefined antes
  });
  const [loading, setLoading] = useState(false);

  const priority = priorityColors[task.priority] || priorityColors.medium;

  // ← corregido: Array.from para que siempre sea array
  const handleAssigneeChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setForm({ ...form, assignee_ids: selected });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTask(task.id, {
        title:        form.title,
        description:  form.description,
        priority:     form.priority,
        assignee_ids: Array.isArray(form.assignee_ids)  // ← forzar array siempre
                        ? form.assignee_ids
                        : [form.assignee_ids].filter(Boolean),
      });
      setEditing(false);
      onRefresh();
    } catch (err) {
      console.error('Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    await deleteTask(task.id);
    onRefresh();
  };

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...styles.card,
            boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
            ...provided.draggableProps.style,
          }}
        >
          {editing ? (
            <form onSubmit={handleSave} style={styles.editForm}>
              <input
                style={styles.editInput}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                autoFocus
              />
              <textarea
                style={{ ...styles.editInput, resize: 'vertical', minHeight: '60px' }}
                placeholder="Descripción (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <select
                style={styles.editInput}
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
                onChange={handleAssigneeChange}  // ← usamos el handler corregido
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.username}
                  </option>
                ))}
              </select>

              <div style={styles.editButtons}>
                <button style={styles.saveBtn} type="submit" disabled={loading}>
                  {loading ? '...' : 'Guardar'}
                </button>
                <button style={styles.cancelBtn} type="button" onClick={() => setEditing(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={styles.cardHeader}>
                <p style={styles.cardTitle}>{task.title}</p>
                <div style={styles.cardActions}>
                  <button style={styles.actionBtn} onClick={() => setEditing(true)}>✎</button>
                  <button style={{ ...styles.actionBtn, color: '#c0392b' }} onClick={handleDelete}>✕</button>
                </div>
              </div>

              {task.description && (
                <p style={styles.cardDesc}>{task.description}</p>
              )}

              <div style={styles.cardFooter}>
                <span style={{ ...styles.priorityBadge, background: priority.bg, color: priority.text }}>
                  {priority.label}
                </span>
                {task.due_date && (
                  <span style={styles.dueDate}>
                    {new Date(task.due_date).toLocaleDateString('es-AR')}
                  </span>
                )}
              </div>

              {task.assignees?.length > 0 && (
                <div style={styles.assignees}>
                  {task.assignees.map(a => (
                    <div key={a.user.id} style={styles.assigneeChip}>
                      {a.user.username.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}

const styles = {
  card:          { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '10px 12px', cursor: 'grab', transition: 'box-shadow 0.15s' },
  cardHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  cardTitle:     { fontSize: '13px', fontWeight: '500', margin: 0, lineHeight: '1.5', flex: 1 },
  cardDesc:      { fontSize: '12px', color: '#888', margin: '6px 0 0', lineHeight: '1.5' },
  cardFooter:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' },
  cardActions:   { display: 'flex', gap: '4px', opacity: 0.4, transition: 'opacity 0.15s' },
  actionBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px 4px', color: '#333' },
  priorityBadge: { fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px' },
  dueDate:       { fontSize: '11px', color: '#999' },
  editForm:      { display: 'flex', flexDirection: 'column', gap: '8px' },
  editInput:     { padding: '7px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', width: '100%', boxSizing: 'border-box' },
  editButtons:   { display: 'flex', gap: '8px' },
  saveBtn:       { flex: 1, padding: '7px', borderRadius: '8px', background: '#1a1a1a', color: '#fff', fontSize: '13px', cursor: 'pointer', border: 'none' },
  cancelBtn:     { flex: 1, padding: '7px', borderRadius: '8px', background: '#fff', color: '#666', fontSize: '13px', cursor: 'pointer', border: '1px solid #ddd' },
  assignLabel:   { fontSize: '11px', color: '#888', marginTop: '4px' },
  assignees:     { display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' },
  assigneeChip:  { width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #4fffb0, #00c8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#080c10' },
};