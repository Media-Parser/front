// 📁 src/hooks/useTrashActions.ts
import { useState, useEffect, useCallback } from "react";
import {
  getTrashDocumentsApi,
  restoreDocumentApi,
  deleteTrashDocumentApi,
  deleteAllTrashDocumentsApi,
} from "../lib/api/documentsApi";
import type { Document } from "../types/documentType";

export const useTrashActions = (user_id: string) => {
  const [trashDocs, setTrashDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrashDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTrashDocumentsApi(user_id);
      setTrashDocs(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError("휴지통 문서 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  const restoreDocument = async (docId: string) => {
    if (!window.confirm("이 문서를 다시 복원하시겠습니까?")) return;
    try {
      await restoreDocumentApi(docId);
      await fetchTrashDocuments();
    } catch (error) {
      alert("복원 실패");
      console.error("복원 실패", error);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (
      !window.confirm(
        "이 문서를 삭제하시겠습니까?\n\n 삭제 시 복구할 수 없습니다."
      )
    )
      return;
    try {
      await deleteTrashDocumentApi(docId);
      await fetchTrashDocuments();
    } catch (error) {
      alert("영구 삭제 실패");
      console.error("영구 삭제 실패", error);
    }
  };

  const deleteAllDocuments = async () => {
    if (
      !window.confirm(
        "휴지통의 모든 문서를 삭제하시겠습니까?\n\n 삭제 시 복구할 수 없습니다."
      )
    )
      return;
    try {
      await deleteAllTrashDocumentsApi();
      await fetchTrashDocuments();
    } catch (error) {
      alert("전체 삭제 실패");
      console.error("전체 삭제 실패", error);
    }
  };

  useEffect(() => {
    if (user_id) fetchTrashDocuments();
  }, [user_id, fetchTrashDocuments]);

  return {
    trashDocs,
    loading,
    error,
    restoreDocument,
    deleteDocument,
    deleteAllDocuments,
    refresh: fetchTrashDocuments,
  };
};
