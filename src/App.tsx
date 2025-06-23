// src/App.tsx
import { ToastContainer } from "react-toastify";
import AppRouter from './routes';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer position="bottom-right"/>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
