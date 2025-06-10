import type { ReactNode } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
}

const Layout = ({ children, showHeader = true, showSidebar = true }: LayoutProps) => {
  return (
    <div className={styles.wrapper}>
      {showHeader && <Header />}
      <div className={styles.body}>
        {showSidebar && <Sidebar />}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;



// ✅ 사용 예시

// ① 기본 사용 (Header + Sidebar 둘 다 포함)
// <Layout>
//   <h2>전체 구성</h2>
// </Layout>

// ② Sidebar 없이 (Header만 사용)
// <Layout showSidebar={false}>
//   <h2>헤더만 있는 화면</h2>
// </Layout>

// ③ Header 없이 (Sidebar만 사용)
// <Layout showHeader={false}>
//   <h2>사이드바만 있는 화면</h2>
// </Layout>

// ④ 둘 다 없이 (껍데기만)
// <Layout showHeader={false} showSidebar={false}>
//   <h2>공개 페이지 또는 단독 레이아웃</h2>
// </Layout>