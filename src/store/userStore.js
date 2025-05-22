import { create } from 'zustand';
import axios from 'axios';

const useUserStore = create((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  fetchUserProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('https://kobklaster.tw1.ru/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ user: response.data });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      set({ user: null });
    }
  },
}));

export default useUserStore; 