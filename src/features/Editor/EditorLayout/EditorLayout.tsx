// src/features/Editor/EditorLayout/EditorLayout.tsx
import { useRef, useState, useEffect, useCallback,forwardRef, useImperativeHandle, } from "react";
import styles from "./EditorLayout.module.css";
import { FiChevronLeft } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

export type EditorLayoutHandle = {
  openRightPanel: () => void;
  closeRightPanel: () => void;
};

type EditorLayoutProps = {
  left: React.ReactNode;
  rightContent: React.ReactNode;
  rightTab: "chatbot" | "suggestion";
  setRightTab: React.Dispatch<React.SetStateAction<"chatbot" | "suggestion">>;
  isRightOpen: boolean;
  setIsRightOpen: (open: boolean) => void;
};

const MIN_RIGHT_WIDTH = 330;
const MAX_RIGHT_WIDTH = 1000;
const INIT_RIGHT_WIDTH = 500;
const RESIST_ZONE = 40;
const CLOSE_THRESHOLD = 100;

const EditorLayout = forwardRef<EditorLayoutHandle, EditorLayoutProps>((
  {
    left, rightContent, rightTab, setRightTab, isRightOpen, setIsRightOpen,
  },
  ref
) => {
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [rightWidth, setRightWidth] = useState(INIT_RIGHT_WIDTH);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [startRightWidth, setStartRightWidth] = useState<number | null>(null);

  // 저항/닫힘 관련
  const [resistX, setResistX] = useState<number | null>(null);
  const [resistDelta, setResistDelta] = useState(0); // 튕김 효과용
  const [closedByDrag, setClosedByDrag] = useState(false);

  // 마우스 누름(드래그) 시작
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    setDragStartX(e.clientX);
    setStartRightWidth(rightWidth);
    setResistX(null);
    setClosedByDrag(false);
    setResistDelta(0);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || dragStartX === null || startRightWidth === null) return;

      let deltaX = dragStartX - e.clientX;
      let newWidth = startRightWidth + deltaX;

      // 열려있을 때
      if (isRightOpen) {
        if (newWidth <= MIN_RIGHT_WIDTH) {
          // resistX는 최초 닿은 위치
          if (resistX === null) setResistX(e.clientX);
          // 저항 zone 안에서는 살짝 튕김(visual only)
          const resistD = Math.max(0, Math.min(RESIST_ZONE, resistX !== null ? resistX - e.clientX : 0));
          setResistDelta(resistD);
          setRightWidth(MIN_RIGHT_WIDTH);
          // 저항선 넘어서 threshold만큼 더 가면 닫힘
          if (
            resistX !== null &&
            e.clientX - resistX > CLOSE_THRESHOLD
          ) {
            setIsRightOpen(false);
            setClosedByDrag(true);
            setResistX(e.clientX);
            setResistDelta(0);
            setRightWidth(0);
          }
        } else if (newWidth >= MAX_RIGHT_WIDTH) {
          setRightWidth(MAX_RIGHT_WIDTH);
          setResistX(null);
          setResistDelta(0);
        } else {
          setRightWidth(newWidth);
          setResistX(null);
          setResistDelta(0);
        }
      }
      // 닫힌 후, 저항 기준보다 왼쪽(CLOSE_THRESHOLD)만큼 이동 시 열림
      else if (closedByDrag && resistX !== null) {
        if (resistX - e.clientX > CLOSE_THRESHOLD) {
          setIsRightOpen(true);
          setRightWidth(MIN_RIGHT_WIDTH);
          setClosedByDrag(false);
          setResistX(e.clientX); // 새 기준
          setResistDelta(0);
          setDragStartX(e.clientX);
          setStartRightWidth(MIN_RIGHT_WIDTH);
        }
      }
    },
    [
      dragStartX,
      startRightWidth,
      isRightOpen,
      resistX,
      closedByDrag,
      setIsRightOpen,
    ]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragStartX(null);
    setStartRightWidth(null);
    setResistX(null);
    setResistDelta(0);
  }, []);

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

  useEffect(() => {
    if (isDragging) {
      document.body.classList.add('dragging');
    } else {
      document.body.classList.remove('dragging');
    }
  }, [isDragging]);

  // 버튼으로 열고닫기
  const handleCloseRight = () => setIsRightOpen(false);
  const handleOpenRight = () => {
    setIsRightOpen(true);
    setRightWidth(INIT_RIGHT_WIDTH);
    setClosedByDrag(false);
    setResistX(null);
    setResistDelta(0);
  };

  useImperativeHandle(ref, () => ({
    openRightPanel: handleOpenRight,
    closeRightPanel: handleCloseRight,
  }));

  // 튕김 효과: transform 적용 (마이너 bounce)
  const resistStyle = resistDelta > 0
    ? { transform: `translateX(-${resistDelta / 2}px)` }
    : {};

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftArea} style={{
        marginRight: isRightOpen ? rightWidth - 150 : 0
      }}>
        {left}
      </div>
      <div
        className={styles.rightPanel}
        style={{
          width: isRightOpen ? rightWidth : 0,
          minWidth: isRightOpen ? MIN_RIGHT_WIDTH : 0,
          maxWidth: isRightOpen ? MAX_RIGHT_WIDTH : 0,
          ...resistStyle,
        }}
      >
        {isRightOpen && (
          <div
            className={styles.divider}
            onMouseDown={handleDividerMouseDown}
            style={{ left: 0 }}
          />
        )}
        {isRightOpen ? (
          <>
            <button
              className={styles.closeButton}
              onClick={handleCloseRight}
              title="닫기"
            >
              <RxCross1 size={16} />
            </button>
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
          </>
        ) : (
          <button
            className={styles.reopenButton}
            onClick={handleOpenRight}
            title="오른쪽 창 열기"
          >
            <FiChevronLeft size={20} />
          </button>
        )}
      </div>
    </div>
  );
});

export default EditorLayout;

