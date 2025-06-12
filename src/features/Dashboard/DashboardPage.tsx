// 📁 src/features/Dashboard/DashboardPage.tsx

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import styles from "./Dashboard.module.css";
import Layout from "../../components/Layout/Layout";

import DocumentCard from "../../components/DocumentCard/DocumentCard";
import { useGroupedDocuments } from "../../hooks/useGroupedDocuments";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import { openDetail } from "../../store/slices/rightClickDetailSlice";
import DocumentDetailSidebar from "../DocumentDetailSideBar/DocumentDetailSideBar";


const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 문서 목록 및 액션 훅
  const {
    documents,
    loading,
    error,
    refetch,
    deleteDocument,
    downloadDocument,
  } = useDocumentActions();

  // 그룹핑 (검색어 반영)
  const { groupedDocs } = useGroupedDocuments(searchTerm, documents);

  // 파일 업로드 훅 (업로드 성공 시 목록 새로고침)
  const { uploadFile } = useFileUpload(refetch);

  // 파일 업로드 이벤트
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  // 문서카드 클릭 상세 이동
  const handleCardClick = (id: string) => {
    navigate(`/detail/${id}`);
  };

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
