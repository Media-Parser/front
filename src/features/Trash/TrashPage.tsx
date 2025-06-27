// 📁 src/features/Trash/TrashPage.tsx
import { useState } from "react";
import styles from "./TrashPage.module.css";
import Layout from "../../components/Layout/Layout";
import DocumentGroupSection from "../Dashboard/components/DocumentGroupSection"; // 그룹 섹션이 있다면
import { useTrashActions } from "../../hooks/useTrashActions";
import { FaTrashAlt } from "react-icons/fa";
import { groupDocumentsByDate } from "../../lib/utils/groupDocumentsByDate";
import type { Document } from "../../types/documentType";
import LoadingOrError from "../../components/Common/LoadingOrError";
import useAuthStore from "../../store/useAuthStore";
import SearchBar from "../../components/SearchBar/SearchBar"; // 검색바 컴포넌트
import Button from "../../components/Button/Button";

const TrashPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const userId = useAuthStore((state) => state.userId) ?? "";

  const {
    trashDocs,
    loading,
    error,
    restoreDocument,
    deleteDocument,
    deleteAllDocuments,
  } = useTrashActions(userId);

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

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
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <Button
            icon={<FaTrashAlt />}
            label="전체 삭제"
            onClick={handleDeleteAll}
          />
        </div>
        <div className={styles.documentList}>
          {Object.keys(groupedDocs).length === 0 ? (
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
      </div>
    </Layout>
  );
};

export default TrashPage;
