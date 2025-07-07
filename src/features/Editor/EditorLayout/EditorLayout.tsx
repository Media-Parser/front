import { useRef, useState, useEffect } from "react";
import styles from "./EditorLayout.module.css";
import { FiChevronLeft } from "react-icons/fi";

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
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rightWidth, setRightWidth] = useState(500);
  const [isRightOpen, setIsRightOpen] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newRightWidth = containerRect.right - e.clientX;

      // 자동 닫기 조건
      if (newRightWidth < 300) {
        setIsRightOpen(false);
        setIsDragging(false);
      } else if (newRightWidth <= 500) {
        setRightWidth(newRightWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleCloseRight = () => {
    setIsRightOpen(false);
  };

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
            ? `1fr 5px ${rightWidth}px`
            : `1fr 5px 0px`,
        }}
      >
        <div className={styles.left}>{left}</div>

        {/* divider + button을 감싸는 래퍼 */}
        <div
          className={styles.dividerWrapper}
          onMouseDown={(e) => {
            // 버튼 위에서 드래그 시작 안 되게 하기 위해 태그 체크
            if ((e.target as HTMLElement).tagName !== "BUTTON" && isRightOpen) {
              setIsDragging(true);
            }
          }}
        >
          <div
            className={`${styles.divider} ${
              !isRightOpen ? styles.dividerClosed : ""
            }`}
          />
          {isRightOpen ? (
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation();
                handleCloseRight();
              }}
              title="닫기"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={handleOpenRight}
              className={styles.reopenButton}
              title="오른쪽 창 열기"
            >
              <FiChevronLeft size={18} />
            </button>
          )}
        </div>

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
      </div>
    </div>
  );
};

export default EditorLayout;
