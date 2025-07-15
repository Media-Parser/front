// src/routes/ProtectedRoute.tsx
import { useRef, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore, { useGlobalFlagStore } from "../store/useAuthStore";
import useAutoLogout from "../hooks/useAutoLogout";
import { getUserInfoApi } from "../lib/api/documentsApi";

const ProtectedRoute = () => {
  useAutoLogout();
  const { token, userId, clearAuth } = useAuthStore();
  const autoLogoutTriggered = useGlobalFlagStore((s) => s.autoLogoutTriggered);
  const setAutoLogoutTriggered = useGlobalFlagStore((s) => s.setAutoLogoutTriggered);
  const location = useLocation();
  const alertedRef = useRef(false);

  const [authChecked, setAuthChecked] = useState(false);

  // *** 1. 항상 플래그 먼저 검사! ***
  if (sessionStorage.getItem("justLoggedOut")) {
    sessionStorage.removeItem("justLoggedOut");
    clearAuth();
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    // *** token, userId 모두 없으면 API 호출/인증체크 하지 않음 ***
    if (!token || !userId) {
      setAuthChecked(true);
      setTimeout(() => setAutoLogoutTriggered(false), 0);
      return;
    }
    getUserInfoApi(userId)
      .then(() => setAuthChecked(true))
      .catch(() => {
        clearAuth();
        setAuthChecked(true);
        if (!alertedRef.current) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          alertedRef.current = true;
          return <Navigate to="/" replace state={{ from: location }} />;
        }
      });
  }, [token, userId, setAutoLogoutTriggered, autoLogoutTriggered, clearAuth]);

  if (!authChecked) return null;

if (!token || !userId) {
  if (!alertedRef.current) {
    alert("잘못된 접근입니다. 로그인 후 이용해주세요.");
    alertedRef.current = true;
  }
  return <Navigate to="/" replace state={{ from: location }} />;
}

  // 6. 정상 접근
  return <Outlet />;
};

export default ProtectedRoute;