import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface Document {
  id: string;
  title: string;
  content: string;
  // 필요한 필드 추가
}

const EditDoc = () => {
  const { id } = useParams<{ id: string }>(); // URL에서 문서 ID 가져오기
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = "b5692619-e583-4d77-9f34-ec0eae73fc5f"; // 임시 고정 id

    const fetchDocument = async () => {
      try {
        const res = await fetch(`/api/documents/${id}`);
        if (!res.ok) {
          throw new Error(`서버 에러: ${res.status}`);
        }
        const data = await res.json();
        setDocument(data);
      } catch (err: any) {
        setError(err.message || "문서를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!document) return <div>문서가 존재하지 않습니다.</div>;

  return (
    <div>
      <h1>{document.title}</h1>
      <p>{document.content}</p>
      {/* 필요한 에디터 컴포넌트 추가 */}
    </div>
  );
};

export default EditDoc;
