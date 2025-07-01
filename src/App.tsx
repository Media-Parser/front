// src/App.tsx
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import AppRouter from "./routes";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";

function App() {
  useEffect(() => {
    const onStorage = () => {
      useAuthStore.getState().syncAuth();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
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
