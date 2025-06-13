// src/hooks/useDocumentActions.ts
import { useEffect, useState, useCallback } from "react";
import { deleteDocumentApi, getDocumentsApi } from "../lib/api/documents_api";
import type { Document } from "../types/documents_type";

export const useDocumentActions = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user_id = localStorage.getItem("user_id") ?? "";

  // 문서 목록 조회
  const fetchDocuments = useCallback(async () => {
    if (!user_id) {
      setDocuments([]);
      setError("로그인 정보가 없습니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getDocumentsApi(user_id);

      // ✅ 데이터가 undefined/null이면 무조건 빈 배열로 처리
      const data = Array.isArray(res.data) ? res.data : [];
      // 위 한 줄이면, 배열 아닐 때도 안전

      const normalized = data.map((doc: any) => ({
        ...doc,
        id: doc.doc_id ?? doc._id ?? "", // id가 없으면 "" (React key 문제 없음)
        date: doc.created_dt ?? "",
        download: true,
        remove: true,
      }));

      setDocuments(normalized);
      setError(null); // ← 에러 초기화
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "문서 목록을 불러오지 못했습니다."
      );
      setDocuments([]);
    }
    setLoading(false);
  }, [user_id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // 삭제 액션
  const deleteDocument = async (id: string) => {
    if (!window.confirm("이 문서를 삭제하시겠습니까?")) return;
    try {
      await deleteDocumentApi(id);
      await fetchDocuments();
    } catch (error) {
      alert("삭제 실패");
      console.error("삭제 실패", error);
    }
  };

  const downloadDocument = (id: string) => {
    window.open(`/documents/${id}/download`, "_blank");
  };

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    deleteDocument,
    downloadDocument,
  };
};
