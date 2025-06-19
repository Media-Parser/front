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

  const {
    document,
    loading,
    error,
    autosave,
    saveDocument,
    isSaving: hookIsSaving,
  } = useEditDocument(id);

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [localIsSaving, setLocalIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // 저장 함수를 부모 컴포넌트에 전달
  useEffect(() => {
    if (onSaveReady && document) {
      onSaveReady(async () => {
        setLocalIsSaving(true);
        setIsSaved(false);
        try {
          // 현재 상태로 문서 업데이트
          await saveDocument();
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
          console.error("Save error:", err);
          alert("저장 중 오류가 발생했습니다.");
        } finally {
          setLocalIsSaving(false);
        }
      });
    }
  }, [onSaveReady, document, saveDocument]);

  // 문서 로드 시 초기값 설정
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setContents(document.contents || "");
    }
  }, [document]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // 자동저장 트리거
    autosave({ title: newTitle });
  };

  const handleContentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContents = e.target.value;
    setContents(newContents);
    // 자동저장 트리거
    autosave({ contents: newContents });
  };

  if (loading) return <div className={styles.message}>로딩 중...</div>;
  if (error) return <div className={styles.message}>에러: {error}</div>;
  if (!document)
    return <div className={styles.message}>문서가 존재하지 않습니다.</div>;

  const isCurrentlySaving = hookIsSaving || localIsSaving;

  return (
    <div className={styles.container}>
      {isCurrentlySaving && <div className={styles.toast}>저장 중...</div>}
      {isSaved && <div className={styles.toast}>저장 완료!</div>}

      <input
        type="text"
        className={styles.titleInput}
        value={title}
        onChange={handleTitleChange}
        placeholder="제목을 입력하세요"
      />
      <textarea
        className={styles.contentsInput}
        value={contents}
        onChange={handleContentsChange}
        placeholder="내용을 입력하세요"
      />
    </div>
  );
};

export default EditDoc;
