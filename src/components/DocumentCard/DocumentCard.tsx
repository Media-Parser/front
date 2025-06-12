/* 📁 src/components/DocumentCard/DocumentCard.tsx */

import React from "react";
import styles from "./DocumentCard.module.css";
import { useLocation } from "react-router-dom";

interface DocumentCardProps {
  title?: string;
  date?: string;
  id?: string;
  download?: boolean;
  remove?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onRightClick?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title = "제목 없음",
  date = "날짜 없음",
  download,
  remove,
  onClick,
  onDelete,
  onRightClick,
}) => {
  const location = useLocation();
  const isTrashPage = location.pathname === "/trash";

  // 다운로드 또는 복구 버튼 클릭 핸들러
  const handleDownloadOrRestore = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isTrashPage) {
      console.log("복구 클릭");
      // 복구 로직 추가 가능
    } else {
      console.log("다운로드 클릭");
      // 다운로드 로직 추가 가능
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  // 우클릭 컨텍스트 메뉴 핸들러
  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick?.();
  };

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
        <button
          className={styles.infoButton}
          onClick={handleInfoClick}
          aria-label="문서 상세정보 보기"
        >
          상세정보
        </button>
        {download && (
          <button
            onClick={handleDownloadOrRestore}
            className={
              isTrashPage ? styles.restoreButton : styles.downloadButton
            }
          >
            {isTrashPage ? "복구" : "다운로드"}
          </button>
        )}
        {remove && (
          <button onClick={handleDelete} className={styles.deleteButton}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
