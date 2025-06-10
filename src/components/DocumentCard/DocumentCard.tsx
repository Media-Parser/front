import React from "react";
import styles from "./DocumentCard.module.css";

interface DocumentCardProps {
  title?: string;
  date?: string;
  score?: boolean;
  download?: boolean;
  remove?: boolean;
  onClick?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title = "제목 없음",
  date = "날짜 없음",
  score,
  download,
  remove,
  onClick,
}) => {
  return (
    <div
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={onClick}
    >
      <h3>{title}</h3>
      <p>{date}</p>
      <div className={styles.cardActions}>
        {score && <span>점수</span>}
        {download && <span>다운로드</span>}
        {remove && <span>삭제</span>}
      </div>
    </div>
  );
};

export default DocumentCard;
