// 📁 src/features/Homepage/Homepage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Layout from '../../components/Layout/Layout';

const fullText = '안녕하세요\n함께 중립적 기사 컨펌을 시작해볼까요?';

const Homepage = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i <= fullText.length) {
        setDisplayedText(fullText.slice(0, i));
      } else {
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500); // 깜빡임 속도
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <Layout showHeader={false} showSidebar={false}>
      <div className={styles.container}>
        <h1 className={styles.title}>기잣말〯ᄊᆞ미</h1>
        <p className={styles.subtitle}>
          {displayedText}
          <span className={styles.cursor}>{showCursor ? '|' : ' '}</span>
        </p>
        <button className={styles.button} onClick={() => navigate('/login')}>
          시작하기
        </button>
      </div>
    </Layout>
  );
};

export default Homepage;
