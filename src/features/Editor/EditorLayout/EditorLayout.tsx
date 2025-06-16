// 📁 src/features/Editor/EditorLayout/EditorLayout.tsx
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
  return (
    <div className={styles.wrapper}>
      {showHeader && <Header />}
      <div className={styles.main}>
        <div className={styles.left}>{left}</div>
        <div className={styles.divider} />
        <div className={styles.right}>{right}</div>
      </div>
    </div>
  );
};

export default EditorLayout;
