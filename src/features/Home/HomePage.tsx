/* 📁 src/features/Home/HomePage.tsx */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

const fullText = "안녕하세요\n함께 중립적 기사 컨펌을 시작해볼까요?";

const Homepage = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i <= fullText.length) {
        setDisplayedText(fullText.slice(0, i));
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  const handleStart = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  return (
    <div className={styles.homepageContainer}>
      <p className={`${styles.subtitle} ${isFadingOut ? styles.fadeOut : ""}`}>
        {displayedText}
        <span className={styles.cursor}>{showCursor ? "|" : " "}</span>
      </p>
      <button
  className={`${styles.button} ${isFadingOut ? styles.fadeOut : ""}`}
  onClick={handleStart}
>
  시작하기
</button>
    </div>
  );
};

export default Homepage;
