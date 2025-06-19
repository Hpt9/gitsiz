import { create } from 'zustand';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const TOKEN_KEY = 'rndtest';
const SECRET = 'kobSecretKey2024'; // Change this to something more secure in production

function encryptToken(token) {
  return CryptoJS.AES.encrypt(token, SECRET).toString();
}

function decryptToken(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}

function getStoredToken() {
  const encrypted = localStorage.getItem(TOKEN_KEY);
  if (!encrypted) return null;
  return decryptToken(encrypted);
}

const useUserStore = create((set) => ({
  user: null,
  token: getStoredToken(),
  setUser: (userData) => set({ user: userData }),
  setToken: (token) => {
    if (token) {
      const encrypted = encryptToken(token);
      localStorage.setItem(TOKEN_KEY, encrypted);
      set({ token });
    } else {
      localStorage.removeItem(TOKEN_KEY);
      set({ token: null });
    }
  },
  fetchUserProfile: async () => {
    const token = getStoredToken();
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
      set({ user: response.data, token });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null });
    }
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  }
}));

export default useUserStore;

// Add debounce mechanism to prevent too many requests
let lastFetchTime = 0;
const DEBOUNCE_TIME = 5000; // 5 seconds

// Add cleanup mechanism to abort pending requests
let controller = null;

export const fetchUserProfile = async () => {
  const now = Date.now();
  if (now - lastFetchTime < DEBOUNCE_TIME) {
    return; // Skip if called too soon
  }
  lastFetchTime = now;

  // Abort any pending request
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();

  const token = getStoredToken();
  if (!token) {
    useUserStore.getState().setUser(null);
    useUserStore.getState().setToken(null);
    return;
  }
  try {
    const response = await axios.get('https://kobklaster.tw1.ru/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    useUserStore.getState().setUser(response.data);
    useUserStore.getState().setToken(token);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request aborted');
    } else {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem(TOKEN_KEY);
      useUserStore.getState().setUser(null);
      useUserStore.getState().setToken(null);
    }
  }
}; 