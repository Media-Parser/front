/* 📁 src/features/Home/DashboardPage.tsx */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import Layout from "../../components/Layout/Layout";
import DocumentCard from "../../components/DocumentCard/DocumentCard";
import type { Document } from "../../types/documents";
import { addToTrash } from "../../store/slices/trashSlice";
import { setDocuments, deleteDocument } from "../../store/slices/documentSlice";
import { moveToTrash } from "../../store/slices/documentSlice";
import { openDetail } from "../../store/slices/documentDetailSlice";
import DocumentDetailSidebar from "../DocumentDetailSideBar/DocumentDetailSideBar";

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const documents: Document[] = useAppSelector(
    (state) => state.document.documents
  );

  const handleDelete = (doc: Document) => {
    dispatch(deleteDocument(doc.id)); // 문서 목록에서 삭제
    dispatch(moveToTrash(doc)); // 휴지통으로 이동 (서버)
    dispatch(addToTrash(doc)); // 휴지통으로 이동 (로컬)
  };

  useEffect(() => {
    dispatch(
      setDocuments([
        {
          id: "doc1",
          title: "오늘 문서 1",
          date: "2025.06.10",
          score: true,
          download: true,
          remove: true,
        },
        {
          id: "doc2",
          title: "오늘 문서 2",
          date: "2025.06.10",
          score: true,
          download: true,
          remove: true,
        },
        {
          id: "doc3",
          title: "지난 문서 1",
          date: "2025.05.30",
          score: true,
          download: true,
          remove: true,
        },
        {
          id: "doc4",
          title: "지난 문서 2",
          date: "2025.05.25",
          score: true,
          download: true,
          remove: true,
        },
        {
          id: "doc5",
          title: "지난 문서 3",
          date: "2025.05.20",
          score: true,
          download: true,
          remove: true,
        },
      ])
    );
  }, [dispatch]);

  const todayDocs = documents.filter((doc) => doc.date === "2025.06.10");
  const earlierDocs = documents.filter((doc) => doc.date !== "2025.06.10");

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
          <div className={styles.uploadButton}>
            <button>파일업로드</button>
          </div>
        </div>
        <section className={styles.documentSection}>
          <h3>Earlier</h3>
          <div className={styles.cardGrid}>
            {earlierDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                date={doc.date}
                //score={doc.score}
                download={doc.download}
                remove={doc.remove}
                onClick={() => navigate(`/detail/${doc.id}`)}
                onDelete={() => handleDelete(doc)}
                onRightClick={() => dispatch(openDetail(doc))}
              />
            ))}
          </div>
        </section>
        <DocumentDetailSidebar />
      </div>
    </Layout>
  );
};

export default DashboardPage;
