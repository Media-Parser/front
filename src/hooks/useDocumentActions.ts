// 📁 src/hooks/useDocumentActions.ts
// 로그인된 사용자의 문서를 조회하고 삭제 및 다운로드 기능을 제공하는 커스텀 훅

import { useEffect, useState, useCallback } from "react";
import {
  deleteDocumentApi,
  getDocumentsApi,
  downloadDocumentApi,
} from "../lib/api/documentsApi";
import type { Document } from "../types/documentType";

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
      setError(null);
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
    // 문서 정보(title, file_type)를 찾기
    const doc = documents.find((d) => d.doc_id === id);
    downloadDocumentApi(id).then((res) => {
      const blob = res.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Content-Disposition에서 파일명 추출 (서버 우선)
      const disposition = res.headers["content-disposition"];
      let finalFilename = "";
      if (disposition) {
        let match = disposition.match(/filename\*=UTF-8''([^;]+)/);
        if (match && match[1]) {
          finalFilename = decodeURIComponent(match[1]);
        } else {
          match = disposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            finalFilename = match[1];
          }
        }
      }
      // 없거나 빈값이면 직접 조합
      if (!finalFilename && doc) {
        finalFilename = `${doc.title}.${doc.file_type}`;
      }

      link.setAttribute("download", finalFilename || "document");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
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
