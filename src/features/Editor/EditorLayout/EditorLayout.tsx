// File: front/src/features/Editor/EditorLayout/EditorLayout.tsx

import { useRef, useState, useEffect, useCallback } from "react";
import styles from "./EditorLayout.module.css";
import { FiChevronLeft } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

type EditorLayoutProps = {
  left: React.ReactNode;
  rightContent: React.ReactNode;
  rightTab: "chatbot" | "suggestion";
  setRightTab: React.Dispatch<React.SetStateAction<"chatbot" | "suggestion">>;
  showHeader?: boolean;
};

const EditorLayout = ({
  left,
  rightContent,
  rightTab,
  setRightTab,
}: EditorLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rightWidth, setRightWidth] = useState(500);
  const [isRightOpen, setIsRightOpen] = useState(true);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const { right } = containerRef.current.getBoundingClientRect();
      const newRightWidth = right - e.clientX;

      if (newRightWidth < 350) {
        setIsRightOpen(false);
        setIsDragging(false);
      } else if (newRightWidth <= 500) {
        setRightWidth(newRightWidth);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCloseRight = () => setIsRightOpen(false);
  const handleOpenRight = () => {
    setIsRightOpen(true);
    setRightWidth(500);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.gridLayout}
        ref={containerRef}
        style={{
          gridTemplateColumns: isRightOpen
            ? `1fr 5px ${rightWidth}px auto`
            : `1fr 5px 0px auto`,
        }}
      >
        <div className={styles.left}>{left}</div>

        {/* 드래그 핸들러 */}
        <div
          className={`${styles.divider} ${
            !isRightOpen ? styles.dividerClosed : ""
          }`}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).tagName !== "BUTTON" && isRightOpen) {
              setIsDragging(true);
            }
          }}
        />

        {/* 오른쪽 패널 */}
        {isRightOpen && (
          <div className={styles.right}>
            <div className={styles.tabButtons}>
              <button
                onClick={() => setRightTab("chatbot")}
                className={rightTab === "chatbot" ? styles.activeTab : ""}
              >
                챗봇
              </button>
              <button
                onClick={() => setRightTab("suggestion")}
                className={rightTab === "suggestion" ? styles.activeTab : ""}
              >
                제안
              </button>
            </div>
            <div className={styles.rightContent}>{rightContent}</div>
          </div>
        )}

        {/* 토글 버튼 */}
        <div className={styles.toggleArea}>
          {isRightOpen ? (
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation();
                handleCloseRight();
              }}
              title="닫기"
            >
              <RxCross1 size={16} />
            </button>
          ) : (
            <button
              className={styles.reopenButton}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenRight();
              }}
              title="오른쪽 창 열기"
            >
              <FiChevronLeft size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
