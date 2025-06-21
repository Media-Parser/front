// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';   // 추가
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>      {/* BrowserRouter로 App을 감싼다! */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
