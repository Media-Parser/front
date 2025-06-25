// src/App.tsx
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import AppRouter from './routes';
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
      <ToastContainer position="bottom-right"/>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
