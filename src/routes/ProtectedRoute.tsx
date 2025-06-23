// src/routes/ProtectedRoute.tsx
import { useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore, { useGlobalFlagStore } from "../store/useAuthStore";
import useAutoLogout from "../hooks/useAutoLogout";
import { useEffect } from "react";

const ProtectedRoute = () => {
  useAutoLogout();
  const { token, userId } = useAuthStore();
  const autoLogoutTriggered = useGlobalFlagStore((s) => s.autoLogoutTriggered);
  const setAutoLogoutTriggered = useGlobalFlagStore((s) => s.setAutoLogoutTriggered);
  const location = useLocation();
  // 중복 알림 방지 ref
  const alertedRef = useRef(false);

  useEffect(() => {
    if (!token || !userId) {
      setTimeout(() => setAutoLogoutTriggered(false), 0);
    }
  }, [token, userId, setAutoLogoutTriggered]);

  if (!token || !userId) {
    if (!autoLogoutTriggered && !alertedRef.current) {
      alert("잘못된 접근입니다. 로그인 후 이용해주세요.");
      alertedRef.current = true;
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;