// src/components/Modal/DocumentTitleModal.tsx
import { useState } from "react";
import styles from "./DocumentTitleModal.module.css";
import toast from "react-hot-toast";

interface Props {
  currentTitle: string;
  docId: string;
  onSave: (title: string) => Promise<void>;
  onClose: () => void;
}

const DocumentTitleModal = ({ currentTitle, docId, onSave, onClose }: Props) => {
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || title === currentTitle) {
      onClose();
      return;
    }
    setLoading(true);
    try {
      await onSave(title.trim());
      toast.success("저장 완료!");
      onClose();
    } catch (err) {
      toast.error("제목 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>제목 변경</h3>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={100}
          onKeyDown={e => {
            if (e.key === "Enter") handleSave();
          }}
        />
        <div className={styles.actions}>
          <button onClick={onClose} disabled={loading}>취소</button>
          <button onClick={handleSave} disabled={loading}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default DocumentTitleModal;
