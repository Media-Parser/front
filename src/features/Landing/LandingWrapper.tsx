/* 📁 src/features/Landing/LandingWrapper.tsx */

import { useLocation } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Homepage from "../Home/HomePage";
import Loginpage from "../Login/LoginPage";
import logoImage from "../../assets/logo.png";
import styles from "./Landing.module.css";

const LandingWrapper = () => {
  const { pathname } = useLocation();

  return (
    <Layout showHeader={false} showSidebar={false}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img className={styles.logoImage} src={logoImage} alt="로고" />
        </div>
        <div className={styles.contentcontainer}>
          {pathname === "/" ? <Homepage /> : <Loginpage />}
        </div>
      </div>
    </Layout>
  );
};

export default LandingWrapper;
