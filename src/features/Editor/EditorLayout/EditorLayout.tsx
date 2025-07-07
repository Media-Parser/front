// 📁 src/features/Editor/EditorLayout/EditorLayout.tsx

import { useRef, useState, useEffect } from "react";
import styles from "./EditorLayout.module.css";

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newRightWidth = containerRect.right - e.clientX;

      if (newRightWidth >= 320 && newRightWidth <= 500) {
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

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.gridLayout}
        ref={containerRef}
        style={{ gridTemplateColumns: `1fr 1px ${rightWidth}px` }}
      >
        <div className={styles.left}>{left}</div>

        <div
          className={styles.divider}
          onMouseDown={() => setIsDragging(true)}
        />

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
      </div>
    </div>
  );
};

export default EditorLayout;
