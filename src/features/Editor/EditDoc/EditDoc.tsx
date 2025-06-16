// 📁 src/features/Editor/EditDoc/EditDoc.ts

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchDocument } from "../../../lib/api/documentsApi"; // axios API 함수 import
import type { Document } from "../../../types/documentType";

const EditDoc = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("문서 ID가 없습니다.");
      setLoading(false);
      return;
    }

    const loadDocument = async () => {
      try {
        console.log("요청할 문서 ID:", id);
        const res = await fetch(`http://127.0.0.1:8000/documents/${id}`);
        if (!res.ok) {
          throw new Error(`서버 에러: ${res.status}`);
        }
        const data = await res.json();
        setDocument(data);
        setError(null); // ✅ 에러 초기화 추가!
      } catch (err: any) {
        setError(err.message || "문서를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!document) return <div>문서가 존재하지 않습니다.</div>;

  return (
    <div>
      <h1>{document.title}</h1>
      <p>{document.contents}</p>
      {/* 에디터 컴포넌트 추가 예정 */}
    </div>
  );
};

export default EditDoc;
