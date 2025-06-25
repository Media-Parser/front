// src/components/DocumentCard/DocumentCard.tsx
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./DocumentCard.module.css";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import Tooltip from "../../components/Tooltip/Tooltip";
import MoveCategoryModal from "../Modal/MoveCategoryModal";
import type { DocumentCardProps } from "../../types/documentType";

const DocumentCard: React.FC<
  DocumentCardProps & { onTitleEdit: () => void }
> = (props) => {
  const {
    title,
    contents = "",
    date,
    onRestore,
    onPermanentDelete,
    download,
    remove,
    onDelete,
    onDownload,
    doc_id = "",
    category_id = "",
    onMoved,
    onTitleEdit,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const isTrashPage = location.pathname === "/trash";

  const [showTooltip, setShowTooltip] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const kebabButtonRef = useRef<HTMLButtonElement>(null);

  // 미리보기 툴팁용 상태/좌표
  const [isHoveringPreview, setIsHoveringPreview] = useState(false);
  const previewRef = useRef<HTMLParagraphElement>(null);

  // Tooltip 위치 계산
  const [tooltipVars, setTooltipVars] = useState<{ [key: string]: string }>({
    "--tooltip-top": "0px",
    "--tooltip-left": "0px",
  });

  useEffect(() => {
    if (showTooltip && kebabButtonRef.current) {
      const rect = kebabButtonRef.current.getBoundingClientRect();
      setTooltipVars({
        "--tooltip-top": `${rect.top}px`,
        "--tooltip-left": `${rect.right + 4}px`,
      });
    }
  }, [showTooltip]);

  // Tooltip Portal
  const tooltipPortal = showTooltip
    ? createPortal(
        <div>
          <div
            className={styles.tooltipOverlay}
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
          />
          <div className={styles.tooltipMenuWrapper} style={tooltipVars}>
            <Tooltip visible={showTooltip}>
              {!isTrashPage && (
                <>
                  <button
                    className={styles.tooltipButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip(false);
                      setTimeout(onTitleEdit, 0);
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
                </>
              )}
              {(download || isTrashPage) && (
                <button
                  className={`${styles.tooltipButton} ${
                    isTrashPage ? styles.restoreButton : styles.downloadButton
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    isTrashPage ? onRestore?.() : onDownload?.();
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
                    isTrashPage ? onPermanentDelete?.() : onDelete?.();
                  }}
                >
                  삭제
                </button>
              )}
            </Tooltip>
          </div>
        </div>,
        document.body
      )
    : null;

  // MoveCategoryModal Portal
  const moveModalPortal =
    showMoveModal &&
    createPortal(
      <MoveCategoryModal
        docId={doc_id ?? ""}
        originCategoryId={category_id ?? ""}
        onClose={() => setShowMoveModal(false)}
        onMoved={onMoved}
      />,
      document.body
    );

  // Tooltip 위치 계산 (툴팁이 열릴 때만 즉시 계산)
  const handleKebabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showTooltip && kebabButtonRef.current) {
      const rect = kebabButtonRef.current.getBoundingClientRect();
      setTooltipVars({
        "--tooltip-top": `${rect.top}px`,
        "--tooltip-left": `${rect.right + 4}px`,
      });
    }
    setShowTooltip(!showTooltip);
  };

  return (
    <div
      className={`${styles.card} ${isTrashPage ? styles.noHover : ""}`}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (showTooltip) {
          e.stopPropagation();
          setShowTooltip(false);
          return;
        }
        if (isTrashPage) {
          e.stopPropagation();
          return;
        }
        navigate(`/editor/${doc_id}`);
      }}
    >
      {tooltipPortal}
      {moveModalPortal}
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
              onClick={handleKebabClick}
            >
              ︙
            </button>
          </div>
        </div>

        {/* 본문 미리보기 항상 표시 */}
        <div className={styles.cardBody}>
          {(contents || "")
            .replace(/^\s+/, "")
            .replace(/\n{2,}/g, "\n")
            .slice(0, 100) + ((contents || "").length > 100 ? "..." : "")}
        </div>

        <div className={styles.cardDate}>
          {dayjs(date).format("YYYY-MM-DD")}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
