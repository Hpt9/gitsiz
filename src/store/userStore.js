import { create } from 'zustand';
import axios from 'axios';

const useUserStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  setUser: (userData) => set({ user: userData }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      set({ token });
    } else {
      localStorage.removeItem('token');
      set({ token: null });
    }
  },
  fetchUserProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    try {
      const response = await axios.get('https://kobklaster.tw1.ru/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      set({ user: response.data, token });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

export default useUserStore; 