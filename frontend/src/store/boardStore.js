import { create } from 'zustand';
import { getBoard, moveTask as moveTaskApi } from '../api/boards';

const useBoardStore = create((set, get) => ({
  board:   null,
  loading: false,

  fetchBoard: async (id) => {
    set({ loading: true });
    try {
      const { data } = await getBoard(id);
      set({ board: data });
    } finally {
      set({ loading: false });
    }
  },

  moveTask: async (taskId, fromColumnId, toColumnId, newOrder) => {
    const board = get().board;
    const previousBoard = structuredClone(board);

    const task = board.columns
      .flatMap((c) => c.tasks)
      .find((t) => String(t.id) === String(taskId));

    if (!task) return;

    const updatedColumns = board.columns.map((col) => {
      if (String(col.id) === String(fromColumnId)) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => String(t.id) !== String(taskId)),
        };
      }
      if (String(col.id) === String(toColumnId)) {
        const newTasks = [...col.tasks];
        newTasks.splice(newOrder, 0, { ...task, order: newOrder });
        return { ...col, tasks: newTasks };
      }
      return col;
    });

    set({ board: { ...board, columns: updatedColumns } });

    try {
      await moveTaskApi(taskId, { column: toColumnId, order: newOrder });
    } catch {
      set({ board: previousBoard });
    }
  },
}));

export default useBoardStore;