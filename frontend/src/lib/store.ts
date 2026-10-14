import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    set({ user, token });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  clearAuth: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  isAuthenticated: () => {
    const state = get();
    if (state.token && state.user) return true;
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token });
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  },
}));

