// src/features/Dashboard/components/DocumentCard.tsx

import React from "react";
import styles from "./DocumentCard.module.css";

interface DocumentCardProps {
  title: string;
  date: string;
  score?: number;
  download?: boolean;
  remove?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  date,
  score,
  download,
  remove,
  onClick,
  onDelete,
  onDownload,
}) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardContent}>
        <h4 className={styles.cardTitle}>{title}</h4>
        <p className={styles.cardDate}>{date}</p>
      </div>
      <div className={styles.cardActions}>
        {score !== undefined && (
          <div className={styles.score}>
            <span className={styles.scoreText}>점수: {score}</span>
          </div>
        )}
        {download && (
          <button className={styles.tag} onClick={(e) => { e.stopPropagation(); onDownload?.(); }}>
            다운로드
          </button>
        )}
        {remove && (
          <button className={styles.tag} onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
