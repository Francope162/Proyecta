import api from './axios';

export const getBoards    = ()     => api.get('/boards/');
export const createBoard  = (data) => api.post('/boards/', data);
export const getBoard     = (id)   => api.get(`/boards/${id}/`);

export const createColumn = (data) => api.post('/columns/', data);
export const reorderColumn = (id, order) => api.patch(`/columns/${id}/reorder/`, { order });

export const createTask  = (data)       => api.post('/tasks/', data);
export const updateTask  = (id, data)   => api.patch(`/tasks/${id}/`, data);
export const moveTask    = (id, data)   => api.patch(`/tasks/${id}/move/`, data);
export const deleteTask  = (id)         => api.delete(`/tasks/${id}/`);