// src/components/DocumentCard.tsx

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./DocumentCard.module.css";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import Tooltip from "../../components/Tooltip/Tooltip";
import MoveCategoryModal from "../../features/Dashboard/components/MoveCategoryModal";
import type { DocumentCardProps } from "../../types/documentType";

const DocumentCard: React.FC<DocumentCardProps> = (props) => {
  const {
    title,
    date,
    onRestore,
    onPermanentDelete,
    download,
    remove,
    onDelete,
    onDownload,
    onRightClick,
    doc_id = "",
    category_id = "",
    onMoved,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const isTrashPage = location.pathname === "/trash";
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const kebabButtonRef = useRef<HTMLButtonElement>(null);

  // Tooltip 위치를 CSS 변수로 전달
  const [tooltipVars, setTooltipVars] = useState({
    "--tooltip-top": "0px",
    "--tooltip-left": "0px",
  } as { [key: string]: string });

  useEffect(() => {
    if (showTooltip && kebabButtonRef.current) {
      const rect = kebabButtonRef.current.getBoundingClientRect();
      setTooltipVars({
        "--tooltip-top": `${rect.top}px`, // 버튼의 top에 맞춤
        "--tooltip-left": `${rect.right + 4}px`, // 버튼 오른쪽 4px에 맞춤
      });
    }
  }, [showTooltip]);

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
      onClick={(e) => {
        if (showTooltip) {
          e.stopPropagation();
          setShowTooltip(false);
          return;
        }
        navigate(`/editor/${doc_id}`);
      }}
    >
      {/* Tooltip/Overlay를 Portal로 함께 렌더링 */}
      {showTooltip &&
        createPortal(
          <>
            <div
              className={styles.tooltipOverlay}
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
            />
            <div className={styles.tooltipMenuWrapper} style={tooltipVars}>
              <Tooltip visible={showTooltip}>
                <button
                  className={styles.tooltipButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRightClick(e);
                  }}
                >
                  제목 변경
                </button>
                <button
                  className={styles.tooltipButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveModal(true);
                  }}
                >
                  문서 이동
                </button>
                {showMoveModal &&
                  createPortal(
                    <MoveCategoryModal
                      docId={doc_id ?? ""}
                      originCategoryId={category_id ?? ""}
                      onClose={() => setShowMoveModal(false)}
                      onMoved={onMoved} // 문서 리스트 새로고침 함수
                    />,
                    document.body
                  )}
                {(download || isTrashPage) && (
                  <button
                    className={`${styles.tooltipButton} ${
                      isTrashPage ? styles.restoreButton : styles.downloadButton
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestoreOrDownload(e);
                    }}
                  >
                    {isTrashPage ? "복구" : "다운로드"}
                  </button>
                )}
                {(remove || isTrashPage) && (
                  <button
                    className={`${styles.tooltipButton} ${styles.deleteButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePermanentDelete(e);
                    }}
                  >
                    삭제
                  </button>
                )}
              </Tooltip>
            </div>
          </>,
          document.body
        )}
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle} title={title}>
            {title.length > 25 ? title.slice(0, 25) + "..." : title}
          </h3>
          <div className={styles.tooltipWrapper}>
            <button
              className={styles.kebabButton}
              aria-label="옵션 열기"
              ref={kebabButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
            >
              ︙
            </button>
          </div>
        </div>
        <p className={styles.previewText}>내용 미리보기</p>
        <div className={styles.cardDate}>
          {dayjs(date).format("YYYY-MM-DD")}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
