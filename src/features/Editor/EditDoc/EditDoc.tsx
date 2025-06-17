// 📁 src/features/Editor/EditDoc/EditDoc.tsx

import { useParams } from "react-router-dom";
import { useEditDocument } from "../../../hooks/useEditDocument";
import { useState, useEffect } from "react";
import styles from "./EditDoc.module.css";

const EditDoc = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div className={styles.message}>문서 ID가 없습니다.</div>;
  }
  const { document, loading, error, autosave } = useEditDocument(id);

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContents(document.contents);
    }
  }, [document]);

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
