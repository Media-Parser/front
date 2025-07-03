// src/App.tsx
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import AppRouter from "./routes";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import { getUserInfoApi } from "./lib/api/documentsApi"; // 유저 정보 불러오기

function App() {
  const { token, clearAuth, syncAuth } = useAuthStore();

  useEffect(() => {
    const onStorage = () => {
      syncAuth();
    };
    window.addEventListener("storage", onStorage);
    // 토큰이 있을 때만 유효성 검사

    const user_id = localStorage.getItem("user_id");
    if (token && user_id) {
      getUserInfoApi(user_id)
        .catch(() => {
          clearAuth();
        });
    }
    return () => window.removeEventListener("storage", onStorage);
  }, [token, clearAuth, syncAuth]);

  return (
    <>
      <AppRouter />
      <ToastContainer position="bottom-right" />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#000000",
            borderRadius: "6px",
            padding: "12px 12px",
            fontSize: "15px",
          },
          success: {
            iconTheme: {
              primary: "#000000",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fee2e2",
            },
          },
        }}
      />
    </>
  );
}

export default App;
