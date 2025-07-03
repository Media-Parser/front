// 📁 src/lib/api/api.ts
import axios from "axios";

// 일반 백엔드 API용
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// AI 서버 전용 API용
const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVER_URL,
});

[api, aiApi].forEach(instance => {
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (!config.headers) config.headers = {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
});

export { api, aiApi };