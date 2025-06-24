import { useState, useCallback } from "react";
import {
  checkTempDocExists,
  getTempDocApi,
  getDocApi,
  autosaveDocumentApi,
  finalizeDocumentApi,
} from "../lib/api/documentsApi";
import type { Document } from "../types/documentType";

export const useEditDocument = (id: string) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTempDoc, setIsTempDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 문서 fetch (temp_docs 우선, 없으면 docs)
  const fetchDocument = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { exists } = await checkTempDocExists(id);
      if (exists) {
        const data = await getTempDocApi(id);
        setIsTempDoc(true);
        setDocument(data);
      } else {
        const data = await getDocApi(id);
        setIsTempDoc(false);
        setDocument(data);
      }
      setError(null);
    } catch (err: any) {
      setDocument(null);
      setError(err.message || "문서 불러오기 오류");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 최초 편집/타이핑 시 temp_docs 없으면 insert, 있으면 patch
  const autosave = useCallback(
    async (data: Partial<Document>) => {
      if (!id) return;
      setIsSaving(true);
      try {
        await autosaveDocumentApi(id, data);
        setIsTempDoc(true);
      } finally {
        setTimeout(() => {
          setIsSaving(false);
        }, 500);
      }
    },
    [id]
  );

  // 최종 저장 (temp_docs → docs, temp_docs 삭제)
  const finalizeDocument = useCallback(async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await finalizeDocumentApi(id);
      setIsTempDoc(false);
      await fetchDocument();
    } finally {
      setIsSaving(false);
    }
  }, [id, fetchDocument]);

  return {
    document, loading, error, isSaving,
    fetchDocument, setDocument,
    autosave, finalizeDocument, isTempDoc
  };
};
