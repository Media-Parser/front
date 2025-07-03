import { useRef, useState, useEffect } from "react";
import type { ReactNode } from "react";
import Header from "../../../components/Header/Header";
import styles from "./EditorLayout.module.css";

interface EditorLayoutProps {
  left: ReactNode;
  right: ReactNode;
  showHeader?: boolean;
}

const EditorLayout = ({
  left,
  right,
  showHeader = true,
}: EditorLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(66.66); // 초기 비율: 2/3
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newLeftWidth > 20 && newLeftWidth < 80) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

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
          {right}
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
