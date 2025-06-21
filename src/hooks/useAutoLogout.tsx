// src/hooks/useAutoLogout.tsx
import { useEffect, useRef } from "react";
import useAuthStore, { useGlobalFlagStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// 테스트 시
const AUTO_LOGOUT_TIME = 1000 * 10; // 10초
const WARNING_BEFORE = 1000 * 5;    // 5초 전

// const AUTO_LOGOUT_TIME = 1000 * 60 * 30; // 30분
// const WARNING_BEFORE = 1000 * 30;        // 30초 전


export default function useAutoLogout() {
  const { token, clearAuth } = useAuthStore();
  const setAutoLogoutTriggered = useGlobalFlagStore((s) => s.setAutoLogoutTriggered);
  const timerRef = useRef<number | null>(null);
  const warnTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);

    // 30초 전 경고
    warnTimerRef.current = window.setTimeout(() => {
      toast.warning(
        <div>
          <b>곧 로그아웃됩니다!</b><br />
          30초 후 자동 로그아웃 예정입니다.
        </div>
      );
    }, AUTO_LOGOUT_TIME - WARNING_BEFORE);

    // 실제 로그아웃
    timerRef.current = window.setTimeout(() => {
      setAutoLogoutTriggered(true);
      toast.info(
        <div>
          시간이 초과되어<br />
          자동 로그아웃 되었습니다.
        </div>
      );
      setTimeout(() => {
        clearAuth();
        navigate("/", { replace: true });
      }, 0);
    }, AUTO_LOGOUT_TIME);
  };

  useEffect(() => {
    if (!token) return;
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    };
  }, [token]);
}
