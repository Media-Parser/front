// src/features/Dashboard/components/DocumentCard.tsx
import React from "react";
import styles from "./DocumentCard.module.css";
import dayjs from "dayjs";

interface DocumentCardProps {
  title: string;
  date: string;
  isTrashPage?: boolean;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  download?: boolean;
  remove?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  date,
  isTrashPage,
  onRestore,
  onPermanentDelete,
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
        <p className={styles.cardDate}>{dayjs(date).format("YYYY-MM-DD")}</p>
      </div>
      <div className={styles.cardActions}>
        {isTrashPage ? (
          <>
          {onRestore && (
            <button
              className={styles.cardButton}
              onClick={(e) => { e.stopPropagation(); onRestore?.(); }}
            >
              복구
            </button>
          )}
          {onPermanentDelete && (
            <button
              className={styles.cardButton}
              onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(); }}
            >
              삭제
            </button>
          )}
          </>
        ) : (
          <>
            {download && (
              <button
                className={styles.cardButton}
                onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
              >
                다운로드
              </button>
            )}
            {remove && (
              <button
                className={styles.cardButton}
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              >
                삭제
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;