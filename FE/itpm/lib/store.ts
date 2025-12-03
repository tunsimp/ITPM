import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  gpa: number;
}

export interface Credentials {
  username: string;
  password: string;
}

interface AuthStore {
  user: User | null;
  credentials: Credentials | null;
  isAuthenticated: boolean;
  login: (user: User, credentials: Credentials) => void;
  logout: () => void;
  getCredentials: () => Credentials | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      credentials: null,
      isAuthenticated: false,
      login: (user: User, credentials: Credentials) =>
        set({ user, credentials, isAuthenticated: true }),
      logout: () => set({ user: null, credentials: null, isAuthenticated: false }),
      getCredentials: () => get().credentials,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        credentials: state.credentials,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
