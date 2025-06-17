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

const EditorSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  const onSave = () => {
    console.log("저장 클릭됨");
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
        <div className={styles.menuItem} onClick={onSave}>
          <Save />
          {isExpanded && <span>저장</span>}
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
