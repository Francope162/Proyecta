import api from './axios';

export const getWorkspaces   = ()           => api.get('/workspaces/');
export const createWorkspace = (data)       => api.post('/workspaces/', data);
export const allMembers = (id) => api.get(`ds/workspaces/${id}/members`);
export const inviteMember    = (id, data)   => api.post(`/workspaces/${id}/invite/`, data);
export const removeMember    = (id, userId) => api.delete(`/workspaces/${id}/members/${userId}/`);