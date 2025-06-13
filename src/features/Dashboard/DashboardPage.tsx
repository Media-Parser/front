// src/features/Dashboard/DashboardPage.tsx

import { useRef, useState } from "react";
import styles from "./Dashboard.module.css";
import Layout from "../../components/Layout/Layout";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import DocumentGroupSection from "./components/DocumentGroupSection";
import { groupDocumentsByDate } from "../../lib/utils/groupDocumentsByDate";
import { FaCloudUploadAlt } from "react-icons/fa";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

const DashboardPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    documents,
    loading,
    error,
    refetch,
    deleteDocument,
    downloadDocument,
    } = useDocumentActions();

  const groupedDocs = groupDocumentsByDate(documents);

  // 파일 업로드 훅 (업로드 성공 시 목록 새로고침)
  const { uploadFile } = useFileUpload(refetch);

  // 파일 업로드 이벤트
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

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
            <FaCloudUploadAlt className={styles.uploadIcon}/>
            파일 업로드
          </button>
        </div>
        {Object.keys(groupedDocs).length === 0 ? (
          <div className={styles.noDocuments}>
            <span>저장된 문서가 없습니다.</span>
          </div>
        ) : (
          Object.entries(groupedDocs).map(([label, docs]) => (
            <DocumentGroupSection
              key={label}
              groupLabel={label}
              documents={docs}
              onDelete={deleteDocument}
              onDownload={downloadDocument}
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
