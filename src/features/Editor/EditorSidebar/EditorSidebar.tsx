// 📁 src/features/Editor/EditorSidebar/EditorSidebar.tsx
import { useState } from "react";
import styles from "./EditorSidebar.module.css";
import {
  Menu,
  Home,
  Settings,
  Trash2,
  Download,
  Save,
  LogOut,
} from "lucide-react";

interface EditorSidebarProps {
  onSave?: () => Promise<void>;
}

const EditorSidebar = ({ onSave }: EditorSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  const handleSave = async () => {
    if (!onSave || isSaving) return;

    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error("저장 오류:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside
      className={`${styles.sidebar} ${
        isExpanded ? styles.expanded : styles.collapsed
      }`}
    >
      <button className={styles.toggleButton} onClick={toggleSidebar}>
        <Menu />
      </button>
      <nav className={styles.menu}>
        <div className={styles.menuItem}>
          <Home />
          {isExpanded && <span>홈</span>}
        </div>
        <div
          className={`${styles.menuItem} ${isSaving ? styles.saving : ""}`}
          onClick={handleSave}
        >
          <Save />
          {isExpanded && <span>{isSaving ? "저장 중..." : "저장"}</span>}
        </div>
        <div className={styles.menuItem}>
          <Settings />
          {isExpanded && <span>설정</span>}
        </div>
        <div className={styles.menuItem}>
          <Trash2 />
          {isExpanded && <span>삭제</span>}
        </div>
        <div className={styles.menuItem}>
          <Download />
          {isExpanded && <span>다운로드</span>}
        </div>
        <div className={styles.menuItem}>
          <LogOut />
          {isExpanded && <span>로그아웃</span>}
        </div>
      </nav>
    </aside>
  );
};

export default EditorSidebar;
