// src/features/Login/OAuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");
      const err = url.searchParams.get("error");
      const user_id = url.searchParams.get("user_id");

      if (token) {
        setToken(token); // localStorage 세팅 포함
        if (user_id) {
          localStorage.setItem("user_id", user_id);
        }
        setLoading(false);
        navigate("/dashboard");
      } else {
        setError(err || "로그인 중 오류가 발생했습니다.");
        setLoading(false);
      }
    })();
  }, [setToken, navigate]);

  return (
    <div style={{ textAlign: "center", paddingTop: "100px" }}>
      {loading && <p>🔐 로그인 처리 중입니다...</p>}
      {!loading && error && <p style={{ color: "red" }}>❌ {error}</p>}
    </div>
  );
};

export default OAuthCallback;
