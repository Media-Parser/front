// src/components/DocumentCard.tsx
import React, { useState } from "react";
import styles from "./DocumentCard.module.css";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import Tooltip from "../../components/Tooltip/Tooltip";
import { useNavigate } from "react-router-dom";

interface DocumentCardProps {
  title: string;
  date: string;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  download?: boolean;
  remove?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onRightClick?: () => void;
  id?: string; // 문서 ID 추가
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  date,
  onRestore,
  onPermanentDelete,
  download,
  remove,
  onClick,
  onDelete,
  onDownload,
  onRightClick,
  id = "", // 기본값으로 빈 문자열 설정
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isTrashPage = location.pathname === "/trash";
  const [showTooltip, setShowTooltip] = useState(false);

  const handleRestoreOrDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    isTrashPage ? onRestore?.() : onDownload?.();
  };

  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    isTrashPage ? onPermanentDelete?.() : onDelete?.();
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRightClick?.();
  };

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/editor/${id}`)}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
    >
      {/* 케밥 버튼 및 툴팁 */}
      <div
        className={styles.tooltipWrapper}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          className={styles.kebabButton}
          aria-label="옵션 열기"
          onClick={(e) => e.stopPropagation()}
        >
          ︙
        </button>

        {showTooltip && (
          <Tooltip visible={showTooltip}>
            <button className={styles.tooltipButton} onClick={handleRightClick}>
              상세정보
            </button>
            <button
              className={styles.tooltipButton}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              문서이동
            </button>

            {(download || isTrashPage) && (
              <button
                className={`${styles.tooltipButton} ${
                  isTrashPage ? styles.restoreButton : styles.downloadButton
                }`}
                onClick={handleRestoreOrDownload}
              >
                {isTrashPage ? "복구" : "다운로드"}
              </button>
            )}

            {(remove || isTrashPage) && (
              <button
                className={`${styles.tooltipButton} ${styles.deleteButton}`}
                onClick={handlePermanentDelete}
              >
                삭제
              </button>
            )}
          </Tooltip>
        )}
      </div>

      {/* 카드 콘텐츠 */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle} title={title}>
          {title.length > 25 ? title.slice(0, 25) + "..." : title}
        </h3>
        <p className={styles.previewText}>내용 미리보기</p>
        <div className={styles.cardDate}>
          {dayjs(date).format("YYYY-MM-DD")}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
