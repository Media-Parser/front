// 📁 src/features/Editor/EditDoc/EditDoc.tsx
import { useParams } from "react-router-dom";
import { useEditDocument } from "../../../hooks/useEditDocument";
import { useState, useEffect } from "react";
import styles from "./EditDoc.module.css";

interface EditDocProps {
  onSaveReady?: (saveFunction: () => Promise<void>) => void;
}

const EditDoc = ({ onSaveReady }: EditDocProps) => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div className={styles.message}>문서 ID가 없습니다.</div>;
  }
  const { document, loading, error, autosave } = useEditDocument(id);

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContents(document.contents);
    }
  }, [document]);

  // 수동 저장 함수
  const handleSave = async () => {
    if (!document) {
      console.warn("❌ 저장 실패: 문서가 없습니다.");
      return;
    }

    console.log("💾 문서 저장 시작...", {
      documentId: id,
      title: title,
      contentsLength: contents.length,
      timestamp: new Date().toISOString(),
    });

    setIsSaving(true);
    try {
      const result = await autosave({ title, contents });
      console.log("✅ 문서 저장 완료!", {
        documentId: id,
        savedTitle: title,
        savedContentsLength: contents.length,
        result: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ 저장 중 오류 발생:", {
        documentId: id,
        error: error,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSaving(false);
      console.log("🔄 저장 상태 리셋 완료");
    }
  };

  // 부모 컴포넌트에 저장 함수 전달
  useEffect(() => {
    if (onSaveReady) {
      onSaveReady(handleSave);
    }
  }, [onSaveReady, title, contents, document]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    autosave({ title: newTitle });
  };

  const handleContentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContents = e.target.value;
    setContents(newContents);
    autosave({ contents: newContents });
  };

  if (loading) return <div className={styles.message}>로딩 중...</div>;
  if (error) return <div className={styles.message}>에러: {error}</div>;
  if (!document)
    return <div className={styles.message}>문서가 존재하지 않습니다.</div>;

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.titleInput}
        value={title}
        onChange={handleTitleChange}
        placeholder="제목을 입력하세요"
        disabled={isSaving}
      />
      <textarea
        className={styles.contentsInput}
        value={contents}
        onChange={handleContentsChange}
        placeholder="내용을 입력하세요"
        disabled={isSaving}
      />
      {isSaving && <div className={styles.savingIndicator}>저장 중...</div>}
    </div>
  );
};

export default EditDoc;
