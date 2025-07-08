// 📁 src/features/Landing/LandingWrapper.tsx

import { useLocation } from "react-router-dom";
import Homepage from "../Home/HomePage";
import Loginpage from "../Login/LoginPage";
import logoImage from "../../assets/polexibleS.png";
import styles from "./Landing.module.css";
import useAuthStore from "../../store/useAuthStore";
import { useEffect } from "react";

const LandingWrapper = () => {
  const { pathname } = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    // 진입시마다 무조건 토큰 및 userId 등 클리어 (SPA history 캐시 진입시도 방지)
    clearAuth();
    sessionStorage.removeItem("justLoggedOut");
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");

    if (window.location.pathname === "/") {
      window.history.pushState(null, "", "/");
      window.history.replaceState(null, "", "/");
    }
  }, [clearAuth]);

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img className={styles.logoImage} src={logoImage} alt="로고" />
      </div>
      <div className={styles.contentcontainer}>
        {pathname === "/" ? <Homepage /> : <Loginpage />}
      </div>
    </div>
  );
};

export default LandingWrapper;
