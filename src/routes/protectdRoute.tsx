// 📁 src/routes/ProtectdRoute.tsx
// token이 없으면 홈으로 리다이렉트
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); // 또는 Zustand 등 사용
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;