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
import SearchBar from "../../components/Searchbar/SearchBar";
import Button from "../../components/Button/Button";
import DownloadDocModal from "../../components/Modal/DownloadDocModal";
import { checkTempDocExists } from "../../lib/api/documentsApi";
import { getUserInfoApi } from "../../lib/api/documentsApi";

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
  const token = useAuthStore((state) => state.token) ?? "";
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { uploadFile } = useFileUpload((docId) => navigate(`/editor/${docId}`));
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!token || !userId) {
      // alert("잘못된 접근입니다. 로그인 후 이용해주세요.");
      window.location.replace("/");
      return;
    }
    // 토큰이 있는데 진짜 유효한지 백엔드에 한 번 체크!
    getUserInfoApi(userId).catch(() => {
      clearAuth();
      window.location.replace("/");
    });
  }, [token, userId, clearAuth]);
  
  // 📌 문서 필터링
  const filteredDocs = documents
    .filter((doc) => doc.category_id === categoryId)
    .filter((doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // 📌 문서 그룹화
  const groupedDocs = groupDocumentsByDate(filteredDocs);

  // 📌 파일 업로드 핸들러
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile({ file, userId, categoryId });
  };

  // 카테고리 업데이트 핸들러
  const handleCategoryUpdate = useCallback(() => {
    fetchCategories();
    refetch();
  }, [fetchCategories, refetch]);

  // categories/loaded 불러온 뒤 유효하지 않은 카테고리면 대시보드로 이동
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

    // 문서 다운로드 핸들러
    const handleDownload = async (doc_id: string) => {
      try {
        const { exists } = await checkTempDocExists(doc_id);
        if (exists) {
          setPendingDocId(doc_id);
          setModalOpen(true);
        } else {
          downloadDocument(doc_id);
        }
      } catch (e) {
        // 네트워크 예외 시 그냥 다운로드 (or alert)
        downloadDocument(doc_id);
      }
    };
  
    // 모달 "확인" (editor로 이동)
    const handleModalConfirm = () => {
      if (pendingDocId) {
        navigate(`/editor/${pendingDocId}`);
      }
      setModalOpen(false);
      setPendingDocId(null);
    };
  
    // 모달 "다운로드" (다운로드 진행)
    const handleModalDownload = () => {
      if (pendingDocId) {
        downloadDocument(pendingDocId);
      }
      setModalOpen(false);
      setPendingDocId(null);
    };
  

  return (
    <Layout sidebar={<Sidebar onRefetch={handleCategoryUpdate} />}>
      <div className={styles.mainArea}>
        <div className={styles.maincontent}>
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
                  onDownload={handleDownload}
                  onMoved={refetch}
                />
              ))
            )}
          </div>
        </div>
        <DownloadDocModal
          open={modalOpen}
          onConfirm={handleModalConfirm}
          onDownload={handleModalDownload}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default DashboardPage;
