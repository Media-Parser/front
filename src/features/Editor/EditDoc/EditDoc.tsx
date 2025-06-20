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

  const { document, loading, error, autosave, autosaveApiCall } =
    useEditDocument(id);
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (onSaveReady && document) {
      onSaveReady(async () => {
        setIsSaving(true); // 저장 시작 시 "저장 중..."
        setIsSaved(false);
        try {
          await autosaveApiCall({
            ...document,
            title,
            contents,
          });
          setIsSaving(false); // 저장 중 표시 끔
          setIsSaved(true); // 저장 완료 표시 켬
          setTimeout(() => setIsSaved(false), 3000); // 3초 후 저장 완료 메시지 제거
        } catch (err) {
          setIsSaving(false);
          alert("저장 중 오류가 발생했습니다.");
        }
      });
    }
  }, [onSaveReady, document, title, contents, autosaveApiCall]);

  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setContents(document.contents || "");
    }
  }, [document]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsSaving(true);
    autosave({ title: newTitle });
    setTimeout(() => setIsSaving(false), 30000);
  };

  const handleContentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContents = e.target.value;
    setContents(newContents);
    setIsSaving(true);
    autosave({ contents: newContents });
    setTimeout(() => setIsSaving(false), 30000);
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
      />
      <textarea
        className={styles.contentsInput}
        value={contents}
        onChange={handleContentsChange}
        placeholder="내용을 입력하세요"
      />
      {isSaving && <div className={styles.savingIndicator}>저장 중...</div>}
    </div>
  );
};

export default EditDoc;
