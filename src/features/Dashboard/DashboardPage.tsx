/* 📁 src/features/Home/DashboardPage.tsx */

import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import Layout from "../../components/Layout/Layout";
import DocumentCard from "../../components/DocumentCard/DocumentCard";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleCardClick = (docId: string) => {
    navigate(`/detail/${docId}`);
  };

  const todayDocs = [
    {
      id: "doc1",
      title: "오늘 문서 1",
      date: "2025.06.10",
      score: true,
      download: true,
      remove: true,
    },
    { id: "doc2", title: "오늘 문서 2", date: "2025.06.10" },
  ];

  const earlierDocs = [
    { id: "doc3", title: "지난 문서 1", date: "2025.05.30" },
    { id: "doc4", title: "지난 문서 2", date: "2025.05.25" },
    { id: "doc5", title: "지난 문서 3", date: "2025.05.20" },
  ];

  return (
    <Layout>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2>문서</h2>
          <input
            type="search"
            className={styles.searchBar}
            placeholder="검색어를 입력하세요"
          />
          <button className={styles.uploadButton}>파일 업로드</button>
        </div>

        <section className={styles.documentSection}>
          <h3>Today</h3>
          <div className={styles.cardGrid}>
            {todayDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                date={doc.date}
                score={doc.score}
                download={doc.download}
                remove={doc.remove}
                onClick={() => handleCardClick(doc.id)}
              />
            ))}
          </div>
        </section>

        <section className={styles.documentSection}>
          <h3>Earlier</h3>
          <div className={styles.cardGrid}>
            {earlierDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                date={doc.date}
                onClick={() => handleCardClick(doc.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DashboardPage;
