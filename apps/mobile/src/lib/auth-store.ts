import { create } from "zustand";
import { setToken, clearToken, apiRequest } from "./api";

interface User {
  id: string;
  email: string;
  name?: string;
  tenantId: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiRequest<{ token: string; user: User }>(
        "/api/mobile/auth/login",
        {
          method: "POST",
          body: { email, password },
        }
      );

      await setToken(response.token);
      set({ user: response.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await clearToken();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await apiRequest<User>("/api/mobile/auth/me");
      set({ user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
