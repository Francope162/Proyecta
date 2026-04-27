import api from './axios';

export const getWorkspaces   = ()           => api.get('/workspaces/workspaces/');
export const createWorkspace = (data)       => api.post('/workspaces/workspaces/', data);
export const allMembers = (id) => api.get(`/workspaces/ds/workspaces/${id}/members`);
export const inviteMember    = (id, data)   => api.post(`/worspaces/workspaces/${id}/invite/`, data);
export const removeMember    = (id, userId) => api.delete(`/workspaces/workspaces/${id}/members/${userId}/`);
export const getWorkspace = (id) => api.get(`/workspaces/workspaces/${id}/`);
export const getMyInvitations = () => api.get('/workspaces/user-invitations/');
export const acceptInvitation = (id) => api.post(`/workspaces/user-invitations/${id}/accept/`);
export const declineInvitation = (id) => api.post(`/workspaces/user-invitations/${id}/decline/`);