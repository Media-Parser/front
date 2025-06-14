// 📁 src/features/Trash/TrashPage.tsx
import { useState } from "react";
import styles from "./TrashPage.module.css";
import Layout from "../../components/Layout/Layout";
import DocumentGroupSection from "../Dashboard/components/DocumentGroupSection"; // 그룹 섹션이 있다면
import { useTrashActions } from "../../hooks/useTrashActions";
import { FaCloudUploadAlt } from "react-icons/fa";
import { groupDocumentsByDate } from "../../lib/utils/groupDocumentsByDate";
import type { Document } from "../../types/documents_type";

const TrashPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const user_id = localStorage.getItem("user_id") ?? "";

  const {
    trashDocs,
    loading,
    error,
    restoreDocument,
    deleteDocument,
    deleteAllDocuments,
  } = useTrashActions(user_id);

  // 검색어 필터링
  const filteredDocs = trashDocs.filter((doc: Document) =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 날짜별 그룹핑
  const groupedDocs = groupDocumentsByDate(filteredDocs); // created_dt 기반

  const handleRestore = (doc_id: string) => {
    restoreDocument(doc_id);
  };

  const handlePermanentDelete = (doc_id: string) => {
    deleteDocument(doc_id);
  };

  const handleDeleteAll = () => {
    deleteAllDocuments();
  };

  return (
    <Layout>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2>삭제된 문서</h2>
          <input
            type="search"
            className={styles.searchBar}
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={styles.uploadButton}
            onClick={handleDeleteAll}
          >
            <FaCloudUploadAlt className={styles.uploadIcon} />
            전체 삭제
          </button>
        </div>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : Object.keys(groupedDocs).length === 0 ? (
          <div className={styles.noDocuments}>
            <span>삭제된 문서가 없습니다.</span>
          </div>
        ) : (
          Object.entries(groupedDocs).map(([label, docs]) => (
            <DocumentGroupSection
              key={label}
              groupLabel={label}
              documents={docs}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              isTrashPage
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default TrashPage;
