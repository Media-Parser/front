import { useNavigate } from "react-router-dom";
import styles from "./TrashPage.module.css";
import Layout from "../../components/Layout/Layout";
import DocumentCard from "../../components/DocumentCard/DocumentCard";
import { useAppSelector } from "../../store/hooks";

const TrashPage = () => {
  const navigate = useNavigate();
  const trashDocuments = useAppSelector(state => state.trash.trashDocuments);
  
  const handleCardClick = (docId: string) => {
    navigate(`/detail/${docId}`);
  };

  // 날짜 기준으로 분류
  const today = "2025.06.10"; // 예시용, 실제로는 오늘 날짜를 구해서 사용 가능
  const todayDocs = trashDocuments.filter(doc => doc.date === today);
  const earlierDocs = trashDocuments.filter(doc => doc.date !== today);

  return (
    <Layout>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2>삭제된 문서</h2>
          <input
            type="search"
            className={styles.searchBar}
            placeholder="검색어를 입력하세요"
          />
        </div>

        <section className={styles.documentSection}>
          <h3>Today</h3>
          <div className={styles.cardGrid}>
            {todayDocs.length === 0 ? (
              <p>오늘 삭제된 문서가 없습니다.</p>
            ) : (
              todayDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  date={doc.date}
                  score={doc.score}
                  download={doc.download}
                  remove={true} // 삭제됨 표시
                  onClick={() => handleCardClick(doc.id)}
                />
              ))
            )}
          </div>
        </section>

        <section className={styles.documentSection}>
          <h3>Earlier</h3>
          <div className={styles.cardGrid}>
            {earlierDocs.length === 0 ? (
              <p>이전에 삭제된 문서가 없습니다.</p>
            ) : (
              earlierDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  date={doc.date}
                  score={doc.score}
                  download={doc.download}
                  remove={true}
                  onClick={() => handleCardClick(doc.id)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TrashPage;
