import React from "react";
import styles from "./DocumentCard.module.css";

interface DocumentCardProps {
  title?: string;
  date?: string;
  score?: boolean;
  download?: boolean;
  remove?: boolean;
  onClick?: () => void;
  onDelete?: () => void; // ✅ 삭제 이벤트 핸들러 추가
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title = "제목 없음",
  date = "날짜 없음",
  score,
  download,
  remove,
  onClick,
  onDelete, // ✅ props 받기
}) => {
  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyPress={onClick}
    >
      <h3>{title}</h3>
      <p>{date}</p>
      <div className={styles.cardActions}>
        {score && <span>점수</span>}
        {download && <span>다운로드</span>}
        {remove && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // 카드 전체 클릭 방지
              onDelete?.();
            }}
            className={styles.deleteButton}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
