// 📁 src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!token || !userId) {
      const timeout = setTimeout(() => {
        alert("잘못된 접근입니다. 로그인 후 이용해주세요.");
        setShouldRedirect(true);
      }, 0);

      return () => clearTimeout(timeout); // StrictMode 중복 실행 방지
    }
  }, [token, userId, location.pathname]);

  if (shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
