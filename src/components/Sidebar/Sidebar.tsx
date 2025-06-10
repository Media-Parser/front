// src/components/Sidebar/Sidebar.tsx
import styles from "./Sidebar.module.css"; // 기존 .css → .module.css
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const topMenus = [
    { label: "문서", path: "/dashboard" },
    { label: "휴지통", path: "/trash" },
    { label: "계정", path: "/account" },
  ];

  const bottomMenus = [
    { label: "지원", path: "/support" },
    { label: "로그아웃", path: "/logout" },
  ];

  const handleMenuClick = (menu: { label: string; path: string }) => {
    navigate(menu.path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.mainNav}>
        <nav>
          <ul>
            {topMenus.map((menu) => (
              <li
                key={menu.label}
                className={`${styles.menuItem} ${
                  isActive(menu.path) ? styles.active : ""
                }`}
                onClick={() => handleMenuClick(menu)}
              >
                {menu.label}
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.separator}></div>
      </div>

      <div className={styles.bottomNav}>
        <nav>
          <ul>
            {bottomMenus.map((menu) => (
              <li
                key={menu.label}
                className={`${styles.menuItem} ${
                  isActive(menu.path) ? styles.active : ""
                }`}
                onClick={() => handleMenuClick(menu)}
              >
                {menu.label}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
