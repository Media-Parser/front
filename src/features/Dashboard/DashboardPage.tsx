// src/features/Home/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import Layout from '../../components/Layout/Layout';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleCardClick = (docId: string) => {
    navigate(`/detail/${docId}`);
  };

  return (
    <Layout>
      <h2>문서 목록</h2>
      <input type="text" placeholder="문서명 검색" className={styles.search} />

      <div className={styles.cardGrid}>
        {/* 문서 카드 샘플 */}
        <div className={styles.card} onClick={() => handleCardClick('123')}>
          <h3>전세 계약서 샘플</h3>
          <p>2024.06.01</p>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
