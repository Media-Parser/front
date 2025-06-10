// src/components/Sidebar/Sidebar.tsx
import styles from './Sidebar.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState('문서');
  const navigate = useNavigate();

  const topMenus = [
    { label: '문서', icon: '📄', path: '/' },
    { label: '휴지통', icon: '🗑️', path: '/trash' },
    { label: '계정', icon: '👤', path: '/account' },
  ];

  const bottomMenus = [
    { label: '지원', icon: '💬', path: '/support' },
    { label: '로그아웃', icon: '🔓', path: '/logout' },
  ];

  const handleMenuClick = (menu: { label: string; path: string }) => {
    setSelectedMenu(menu.label);
    navigate(menu.path);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <ul className={styles.menu}>
          {topMenus.map((menu) => (
            <li
              key={menu.label}
              className={`${styles.menuItem} ${selectedMenu === menu.label ? styles.active : ''}`}
              onClick={() => handleMenuClick(menu)}
            >
              <span className={styles.icon}>{menu.icon}</span>
              {menu.label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.bottomSection}>
        <hr />
        <ul className={styles.menu}>
          {bottomMenus.map((menu) => (
            <li
              key={menu.label}
              className={`${styles.menuItem} ${selectedMenu === menu.label ? styles.active : ''}`}
              onClick={() => handleMenuClick(menu)}
            >
              <span className={styles.icon}>{menu.icon}</span>
              {menu.label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
