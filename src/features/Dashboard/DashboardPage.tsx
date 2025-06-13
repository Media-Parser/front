// 📁 src/features/Dashboard/DashboardPage.tsx

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import styles from "./Dashboard.module.css";
import Layout from "../../components/Layout/Layout";

import DocumentCard from "../../components/DocumentCard/DocumentCard";

import type { Document } from "../../types/documents";
import { addToTrash } from "../../store/slices/trashSlice";
import { setDocuments, deleteDocument } from "../../store/slices/documentSlice";
import { moveToTrash } from "../../store/slices/documentSlice";
import { openDetail } from "../../store/slices/documentDetailSlice";
import { useGroupedDocuments } from "../../hooks/useGroupedDocuments";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useDocumentActions } from "../../hooks/useDocumentActions";
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="file"
            accept=".hwp, .hwpx"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <button
            className={styles.uploadButton}
            onClick={() => fileInputRef.current?.click()}
          >
            파일 업로드
          </button>
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
        {Object.keys(groupedDocs).length === 0 ? (
          <div className={styles.noDocuments}>
            <span>저장된 문서가 없습니다.</span>

          </div>
        ) : (
          Object.entries(groupedDocs).map(([date, docs]) => (
            <section key={date} className={styles.documentSection}>
              <h3>{date}</h3>
              <div className={styles.cardGrid}>
                {docs.map((doc) => (
                  <DocumentCard
                    key={doc.id ?? doc._id}
                    title={doc.title ?? doc.filename ?? ""}
                    date={doc.date ?? ""}
                    score={doc.score}
                    download={doc.download}
                    remove={doc.remove}
                    onClick={() => handleCardClick(doc.id)}
                    onDelete={() => deleteDocument(doc.id)}
                    onDownload={() => downloadDocument(doc.id)}
                    onRightClick={() => dispatch(openDetail(doc))} // 💡 기존 slice 기능도 유지
                  />
                ))}
              </div>
            </section>
          ))
        )}

        <DocumentDetailSidebar />
      </div>
    </Layout>
  );
};

export default DashboardPage;
