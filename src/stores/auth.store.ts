import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import type { User } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<string | null>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            loading: false
          });
          return data.user as User;
        } catch (e) {
          set({ loading: false });
          throw e;
        }
      },

      logout: () => {
        const { refreshToken, accessToken } = get();
        if (refreshToken && accessToken) {
          axios
            .post(
              `${API_URL}/api/auth/logout`,
              { refreshToken },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            .catch(() => null);
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          set({ accessToken: data.accessToken });
          return data.accessToken as string;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
          return null;
        }
      },

      bootstrap: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        try {
          const { data } = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          set({ user: data });
        } catch {
          // tenta refresh
          const newToken = await get().refresh();
          if (!newToken) set({ user: null, accessToken: null, refreshToken: null });
        }
      }
    }),
    { name: "rotacerta-auth" }
  )
);
