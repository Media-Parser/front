// 📁 src/store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => {
    set({ token });
    localStorage.setItem("token", token);    // localStorage에 저장!
  },
  clearToken: () => {
    set({ token: null });
    localStorage.removeItem("token");        // 로그아웃시 삭제!
  },
}));

export default useAuthStore;
