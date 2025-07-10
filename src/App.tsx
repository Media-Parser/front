// src/App.tsx
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import AppRouter from "./routes";
import { Toaster, toast } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import { getUserInfoApi } from "./lib/api/documentsApi"; // 유저 정보 불러오기

function App() {
  const { token, clearAuth, syncAuth } = useAuthStore();

  useEffect(() => {
    const onStorage = () => {
      syncAuth();
    };
    window.addEventListener("storage", onStorage);

    const user_id = localStorage.getItem("user_id");
    if (token && user_id) {
      getUserInfoApi(user_id).catch(() => {
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
            background: "#f9f9f9", // 부드러운 흰회색
            color: "#333333", // 진하지 않은 다크 그레이
            borderRadius: "4px", // 살짝 더 둥글게
            padding: "10px 8px", // 패딩 약간 키우기
            fontSize: "14px", // 조금 작게, 깔끔하게
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // 은은한 그림자
            fontWeight: 500, // 중간 굵기
          },
          success: {
            iconTheme: {
              primary: "#66cdaa",
              secondary: "#000000",
            },
          },
          error: {
            iconTheme: {
              primary: "#800020",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
