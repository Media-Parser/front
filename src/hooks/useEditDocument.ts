// useEditDocument.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { readDocument, autosaveDocumentApi } from "../lib/api/documentsApi";
import type { Document } from "../types/documentType";
import debounce from "lodash.debounce";

const LOCAL_KEY_PREFIX = "tempdoc:";

export const useEditDocument = (id: string) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      localStorage.setItem(`${LOCAL_KEY_PREFIX}${id}`, JSON.stringify(data));
      setError(null);
    } catch (err: any) {
      const raw = localStorage.getItem(`${LOCAL_KEY_PREFIX}${id}`);
      if (raw) {
        setDocument(JSON.parse(raw));
        setError("서버 연결이 불안정하여 로컬 데이터로 불러왔습니다.");
      } else {
        setDocument(null);
        setError(err.message || "문서 불러오기 오류");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

   // 임시저장 API 호출 (POST 또는 PUT 등 서버 API 맞춰서 수정)
  const autosaveApiCall = useCallback(
    async (data: Partial<Document>) => {
      console.log("autosaveApiCall 호출, data:", data);
      if (!id) return;
      try {
        await autosaveDocumentApi(id, data);
      } catch (err) {
        console.warn("임시저장 실패", err);
      }
    },
    [id]
  );

  // 디바운스된 임시저장 함수
  const debouncedAutosave = useRef(
    debounce((data: Partial<Document>) => {
      autosaveApiCall(data);
    }, 30000)
  ).current;

  // 임시저장 트리거 (외부에서 호출)
  const autosave = (updatedData: Partial<Document>) => {
    setDocument((prev) => (prev ? { ...prev, ...updatedData } : null));
    debouncedAutosave(updatedData);
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    document,
    loading,
    error,
    fetchDocument: fetch,
    //updateDocument: update,
    autosave,
    setDocument,
    autosaveApiCall,
  };
};


  // // 수정 함수 (최종 저장 시점에 사용)
  // const update = useCallback(
  //   async (updatedData: Partial<Document>) => {
  //     if (!id) {
  //       setError("문서 ID가 없습니다.");
  //       return;
  //     }
  //     try {
  //       // TODO: updateDocumentApi API 완성되면 사용
  //       // const updated = await updateDocumentApi(id, updatedData);
  //       // setDocument(updated);
  //       // setError(null);
  //       // return updated;

  //       // 임시로 setDocument만 업데이트
  //       setDocument((prev) => (prev ? { ...prev, ...updatedData } : null));
  //       setError(null);
  //       return null;
  //     } catch (err: any) {
  //       setError(err.message || "문서 수정 오류");
  //       throw err;
  //     }
  //   },
  //   [id]
  // );
