// src/store/useAuthStore.ts
import { create } from "zustand";
import { LOCAL_KEY_PREFIX } from "../constants/storage";

interface AuthState {
  token: string | null;
  userId: string | null;
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
  syncAuth: () => void;  
}

interface AutoLogoutFlagState {
  autoLogoutTriggered: boolean;
  setAutoLogoutTriggered: (value: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  userId: localStorage.getItem("user_id"),
  setAuth: (token, userId) => {
    set({ token, userId });
    localStorage.setItem("token", token);
    localStorage.setItem("user_id", userId);
  },
  clearAuth: () => {
    set({ token: null, userId: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    sessionStorage.setItem("justLoggedOut", "1");

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LOCAL_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
  syncAuth: () => {
    set({
      token: localStorage.getItem("token"),
      userId: localStorage.getItem("user_id"),
    });
  },
}));

export const useGlobalFlagStore = create<AutoLogoutFlagState>(set => ({
  autoLogoutTriggered: false,
  setAutoLogoutTriggered: (value) => set({ autoLogoutTriggered: value }),
}));

export default useAuthStore;
