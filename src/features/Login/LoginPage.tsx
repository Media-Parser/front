/* 📁 src/features/Login/LoginPage.tsx */

import styles from "../Login/Login.module.css";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const LoginPage = () => {
  return (
    <div className={styles.buttonBox}>
      <a className={styles.google} href={`${backendURL}/auth/google`}>
        <img src="/src/assets/google.svg" alt="google" />
        <span>Google로 시작하기</span>
      </a>
      <a className={styles.kakao} href={`${backendURL}/auth/kakao`}>
        <img src="/src/assets/kakao.svg" alt="kakao" />
        <span>카카오로 시작하기</span>
      </a>
      <a className={styles.naver} href={`${backendURL}/auth/naver`}>
        <img src="/src/assets/naver.svg" alt="naver" />
        <span>네이버로 시작하기</span>
      </a>
    </div>
  );
};

export default LoginPage;
