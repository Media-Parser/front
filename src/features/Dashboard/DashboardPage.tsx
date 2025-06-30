// 📁 src/features/Dashboard/DashboardPage.tsx
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import Layout from "../../components/Layout/Layout";
import { useFileUpload } from "../../hooks/useFileUpload";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import DocumentGroupSection from "./components/DocumentGroupSection";
import { groupDocumentsByDate } from "../../lib/utils/groupDocumentsByDate";
import { FaCloudUploadAlt } from "react-icons/fa";
import LoadingOrError from "../../components/Common/LoadingOrError";
import { useCategories } from "../../hooks/useCategories";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import useAuthStore from "../../store/useAuthStore";
import SearchBar from "../../components/SearchBar/SearchBar";
import Button from "../../components/Button/Button";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

const DashboardPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { categoryPath } = useParams();
  const { categories, loaded, fetchCategories } = useCategories();
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId) ?? "";
  const { uploadFile } = useFileUpload((docId) => navigate(`/editor/${docId}`));

  const {
    documents,
    loading,
    error,
    refetch,
    deleteDocument,
    downloadDocument,
  } = useDocumentActions();

  // ✅ 항상 loaded 체크 후 비교!
  const currentCategory = useMemo(() => {
    if (!categoryPath) return { category_id: "", label: "문서" };
    const matched = categories.find((c) => {
      let slug = c.path?.replace(/^\/dashboard\//, "");
      return slug === categoryPath;
    });
    return matched;
  }, [categories, categoryPath]);

  const categoryId = currentCategory?.category_id ?? "";

  useEffect(() => {
    refetch();
  }, [categoryId]);

  const filteredDocs = documents
    .filter((doc) => doc.category_id === categoryId)
    .filter((doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const groupedDocs = groupDocumentsByDate(filteredDocs);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile({ file, userId, categoryId });
  };

  const handleCategoryUpdate = useCallback(() => {
    fetchCategories();
    refetch();
  }, [fetchCategories, refetch]);

  // ✅ categories/loaded 불러온 뒤 유효하지 않은 카테고리면 대시보드로 이동
  useEffect(() => {
    if (
      categoryPath &&
      loaded &&
      !categories.some((c) => {
        let slug = c.path?.replace(/^\/dashboard\//, "");
        return slug === categoryPath;
      })
    ) {
      navigate("/dashboard", { replace: true });
    }
  }, [categoryPath, categories, loaded, navigate]);

  if (loading || !loaded) {
    return <LoadingOrError loading={true} error={error} />;
  }

  return (
    <Layout sidebar={<Sidebar onRefetch={handleCategoryUpdate} />}>
      <div className={styles.mainArea}>
        <div className={styles.mainAreaHeader}>
          <h2>{currentCategory?.label || "문서"}</h2>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <input
            type="file"
            accept=".hwp, .hwpx"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <Button
            className={styles.uploadButton}
            icon={<FaCloudUploadAlt />}
            label="파일 업로드"
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
        <div className={styles.documentList}>
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
                onMoved={refetch}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
