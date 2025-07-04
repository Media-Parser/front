// 📁 src/features/Editor/EditorLayout/EditorLayout.tsx

import { useRef, useState, useEffect } from "react";
import type { ReactNode } from "react";
import Header from "../../../components/Header/Header";
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
  showHeader = true,
}: EditorLayoutProps) => {
  const [leftWidth, setLeftWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // 최소 / 최대 너비 제한
      if (newLeftWidth >= 30 && newLeftWidth <= 70) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
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
      <div className={styles.main} ref={containerRef}>
        <div
          className={styles.left}
          style={{ width: `${leftWidth}%`, minWidth: "500px" }}
        >
          {left}
        </div>

        <div
          className={styles.divider}
          onMouseDown={() => setIsDragging(true)}
        />

        <div
          className={styles.right}
          style={{
            width: `${100 - leftWidth}%`,
            maxWidth: "500px",
            minWidth: "320px",
          }}
        >
          {/* 🔽 오른쪽 탭 버튼 */}
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

          {/* 🔽 오른쪽 실제 콘텐츠 */}
          <div className={styles.rightContent}>{rightContent}</div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
