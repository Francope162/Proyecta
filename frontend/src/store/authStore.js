import { create } from 'zustand';
import { login as loginApi, getMe, register as registerApi } from '../api/auth';

const useAuthStore = create((set) => ({
  user:    null,
  loading: false,
  error:   null,

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      await registerApi(data);
    } catch (e) {
      set({ error: e.response?.data || 'Error al registrarse' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await loginApi(credentials);
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);
      const me = await getMe();
      set({ user: me.data });
    } catch (e) {
      set({ error: e.response?.data || 'Credenciales incorrectas' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await getMe();
      set({ user: data });
    } catch {
      localStorage.clear();
    }
  },
}));

export default useAuthStore;