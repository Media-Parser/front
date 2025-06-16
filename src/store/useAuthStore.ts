// 📁 src/store/useAuthStore.ts
// ✅ Zustand를 사용한 인증 토큰 전역 상태 관리

import { create } from "zustand";

// 🔒 상태 타입 정의
interface AuthState {
  token: string | null; // 현재 로그인된 사용자의 토큰
  setToken: (token: string) => void; // 토큰 저장 함수
  clearToken: () => void; // 토큰 삭제 함수
}

// 🏪 Zustand 전역 스토어 생성
const useAuthStore = create<AuthState>((set) => ({
  token: null, // 초기값: 로그인되지 않은 상태

  // 🔐 토큰 저장 함수: 상태와 localStorage에 함께 저장
  setToken: (token) => {
    localStorage.setItem("token", token); // 브라우저 localStorage에도 저장
  },

  // 🚪 로그아웃 함수: 상태와 localStorage에서 제거
  clearToken: () => {
    set({ token: null }); // Zustand 상태 초기화
    localStorage.removeItem("token"); // localStorage에서도 삭제
  },
}));

export default useAuthStore;
