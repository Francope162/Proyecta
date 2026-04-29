import api from './axios';

export const register = (data) => api.post('/auth/register/', data);
export const login    = (data) => api.post('/auth/login/', data);
export const getMe    = ()     => api.get('/auth/me/');
export const getProfile = (username) => api.get(`/auth/profile/${username}/`);
export const updateProfile = (data) => {
  const form = new FormData();
  if (data.bio   !== undefined) form.append('bio', data.bio);
  if (data.avatar_url)              form.append('avatar_url', data.avatar_url);
  return api.patch('/auth/me/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};