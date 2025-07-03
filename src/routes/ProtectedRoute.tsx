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

  useEffect(() => {
    // 로그아웃 시 플래그 감지
    const justLoggedOut = sessionStorage.getItem("justLoggedOut");

    // 1. 로그인 정보가 없으면
    if (!token || !userId) {
      setAuthChecked(true);
      setTimeout(() => setAutoLogoutTriggered(false), 0);
      if (!justLoggedOut && !autoLogoutTriggered && !alertedRef.current) {
        alert("잘못된 접근입니다. 로그인 후 이용해주세요.");
        alertedRef.current = true;
      }
      // 플래그는 항상 지워준다
      sessionStorage.removeItem("justLoggedOut");
      return;
    }

    // 2. 로그인 정보가 있으면, 서버에 실제 유저 확인
    getUserInfoApi(userId)
      .then(() => {
        setAuthChecked(true); // 인증 통과
      })
      .catch(() => {
        clearAuth();
        setAuthChecked(true);
        if (!alertedRef.current) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          alertedRef.current = true;
        }
      });
    // eslint-disable-next-line
  }, [token, userId, setAutoLogoutTriggered, autoLogoutTriggered, clearAuth]);

  // 아직 인증 확인 중이면 아무것도 렌더하지 않음
  if (!authChecked) return null;

  if (!token || !userId) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;