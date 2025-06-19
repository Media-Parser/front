// 📁 src/hooks/useEditDocument.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { readDocument, autosaveDocumentApi } from "../lib/api/documentsApi";
import type { Document } from "../types/documentType";
import debounce from "lodash.debounce";

export const useEditDocument = (id: string) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 문서 불러오기
  const fetch = useCallback(async () => {
    if (!id) {
      setError("문서 ID가 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await readDocument(id);
      setDocument(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "문서 불러오기 오류");
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 임시저장 API 호출 (수동 저장용)
  const autosaveApiCall = useCallback(
    async (data: Partial<Document>) => {
      console.log("autosaveApiCall 호출, data:", data);
      if (!id) return;

      setIsSaving(true);
      try {
        const response = await autosaveDocumentApi(id, data);
        console.log("Save successful:", response);
        return response;
      } catch (err) {
        console.error("저장 실패:", err);
        throw err; // Re-throw to handle in calling component
      } finally {
        setIsSaving(false);
      }
    },
    [id]
  );

  // 자동저장 API 호출 (타이핑 중 자동저장용)
  const autosaveApiCallSilent = useCallback(
    async (data: Partial<Document>) => {
      console.log("autosaveApiCallSilent 호출, data:", data);
      if (!id) return;

      try {
        await autosaveDocumentApi(id, data);
        console.log("Auto-save successful");
      } catch (err) {
        console.warn("자동저장 실패:", err);
      }
    },
    [id]
  );

  // 디바운스된 자동저장 함수 (3초로 단축)
  const debouncedAutosave = useRef(
    debounce((data: Partial<Document>) => {
      autosaveApiCallSilent(data);
    }, 3000) // 30초에서 3초로 변경
  ).current;

  // 자동저장 트리거 (외부에서 호출 - 타이핑 중)
  const autosave = (updatedData: Partial<Document>) => {
    // 로컬 상태 즉시 업데이트
    setDocument((prev) => (prev ? { ...prev, ...updatedData } : null));
    // 디바운스된 API 호출
    debouncedAutosave(updatedData);
  };

  // 수동 저장 함수 (저장 버튼용)
  const saveDocument = useCallback(async () => {
    if (!document) return;

    try {
      await autosaveApiCall(document);
    } catch (err) {
      throw err; // Re-throw to handle in calling component
    }
  }, [document, autosaveApiCall]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // 컴포넌트 언마운트 시 debounce 정리
  useEffect(() => {
    return () => {
      debouncedAutosave.cancel();
    };
  }, [debouncedAutosave]);

  return {
    document,
    loading,
    error,
    isSaving,
    fetchDocument: fetch,
    autosave,
    setDocument,
    autosaveApiCall,
    saveDocument, // 새로 추가된 수동 저장 함수
  };
};
