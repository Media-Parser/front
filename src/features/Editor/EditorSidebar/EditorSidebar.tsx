// 📁 src/features/Editor/EditorSidebar/EditorSidebar.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EditorSidebar.module.css";
import { Menu, Home, Trash2, Download, Save, LogOut, Icon } from "lucide-react";
import { useDocumentActions } from "../../../hooks/useDocumentActions";
import { useParams } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";
import logo from "../../../assets/p.png";

interface EditorSidebarProps {
  onSave?: () => Promise<void>;
}

const EditorSidebar = ({ onSave }: EditorSidebarProps) => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div className={styles.message}>문서 ID가 없습니다.</div>;
  }
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  const [isSaving, setIsSaving] = useState(false);
  const { deleteDocument, downloadDocument } = useDocumentActions();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleDelete = async () => {
    await deleteDocument(id);
    alert("삭제를 완료했습니다.");
    navigate("/dashboard");
  };

  const handleDownload = async () => {
    await downloadDocument(id);
  };

  const handleSave = async () => {
    // 저장 버튼 클릭 시 모든 input blur 처리
    document.activeElement instanceof HTMLElement &&
      document.activeElement.blur();

    if (!onSave) return;
    setIsSaving(true);

    try {
      await onSave();
      // alert("저장을 완료했습니다.");
    } catch (error) {
      console.error("Save error:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("정말 로그아웃하시겠습니까?")) {
      alert("로그아웃을 완료했습니다.");
      clearAuth();
      navigate("/");
    }
  };

  const handleMenuClick = (item: (typeof menuItems)[number]) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const menuItems = [
    {
      icon: <img src={logo} className={styles.logo} />,
      label: "  ",
      action: toggleSidebar,
    },
    { icon: <Home />, label: "홈", path: "/dashboard" },
    { icon: <Save />, label: "저장", action: handleSave },
    { icon: <Trash2 />, label: "삭제", action: handleDelete },
    { icon: <Download />, label: "파일 다운", action: handleDownload },
    { icon: <LogOut />, label: "로그아웃", action: handleLogout },
  ];

  return (
    <aside
      className={`${styles.sidebar} ${
        isExpanded ? styles.expanded : styles.collapsed
      }`}
    >
      <nav className={styles.menu}>
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            className={`${styles.menuItem} ${
              item.label === "저장" && isSaving ? styles.saving : ""
            } ${item.label === "메뉴" ? styles.menuHover : ""}`}
            onClick={() => handleMenuClick(item)}
          >
            {item.icon}
            {isExpanded && (
              <span>
                {item.label === "저장" && isSaving ? "저장 중..." : item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default EditorSidebar;
