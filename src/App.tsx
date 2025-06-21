// src/App.tsx
import { ToastContainer } from "react-toastify";
import AppRouter from './routes';

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer position="bottom-right"/>
    </>
  );
}

export default App;
