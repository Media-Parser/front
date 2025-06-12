// 예시: DocumentDetailSidebar.tsx
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { closeDetail } from "../../store/slices/documentDetailSlice";
import styles from "./DocumentDetailSideBar.module.css";
import { useEffect } from "react";

const DocumentDetailSidebar = () => {
  const { open, document } = useAppSelector((state) => state.rightClickDetail);
  const dispatch = useAppDispatch();

  // ESC 키 누르면 닫히도록
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(closeDetail());
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, dispatch]);

  if (!open || !document) return null;

  return (
    <aside className={styles.sidebar}>
      <h2>{document.title}</h2>
      <p>날짜: {document.date}</p>
      {/* 기타 세부 정보 */}
      <button onClick={() => dispatch(closeDetail())}>닫기</button>
    </aside>
  );
};

export default DocumentDetailSidebar;
