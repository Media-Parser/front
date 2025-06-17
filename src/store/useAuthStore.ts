// src/store/useAuthStore.ts
import { create } from "zustand";

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const tokenFromStorage = localStorage.getItem("token");

const useAuthStore = create<AuthState>((set) => ({
  token: tokenFromStorage || null, // null 안전 처리

  setToken: (token) => {
    set({ token });
    localStorage.setItem("token", token); // 여기서만 localStorage 세팅
  },

  clearToken: () => {
    set({ token: null });
    localStorage.removeItem("token");
  },
}));

export default useAuthStore;
