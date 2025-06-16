import type { ReactNode } from "react";
import Header from "../../../components/Header/Header";
import EditorSidebar from "../EditorSidebar/EditorSidebar";
import styles from "./EditorLayout.module.css";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
}

const EditorLayout = ({
  children,
  showHeader = true,
  showSidebar = true,
}: LayoutProps) => {
  return (
    <div className={styles.wrapper}>
      {showHeader && <Header />}
      <div className={styles.body}>
        {showSidebar && <EditorSidebar />}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default EditorLayout;
