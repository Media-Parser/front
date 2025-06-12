import styles from "./Sidebar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);

  const topMenus = [
    { label: "문서", path: "/dashboard", hasDropdown: true },
    { label: "휴지통", path: "/trash" },
    { label: "계정", path: "/account" },
  ];

  const documentSubmenus = [
    { label: "카테고리1", path: "/dashboard/category1" },
    { label: "카테고리2", path: "/dashboard/category2" },
  ];

  const bottomMenus = [
    { label: "지원", path: "/support" },
    { label: "로그아웃", path: "/logout" },
  ];

  const handleMenuClick = (menu: {
    label: string;
    path: string;
    hasDropdown?: boolean;
  }) => {
    if (menu.hasDropdown) {
      setIsDocDropdownOpen((prev) => !prev);
    } else {
      navigate(menu.path);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.mainNav}>
        <nav>
          <ul>
            {topMenus.map((menu) => (
              <li key={menu.label}>
                <div
                  className={`${styles.menuItem} ${
                    isActive(menu.path) ? styles.active : ""
                  }`}
                >
                  <span
                    className={styles.menuLabel}
                    onClick={() => navigate(menu.path)}
                  >
                    {menu.label}
                  </span>
                  {menu.hasDropdown && (
                    <span
                      className={styles.dropdownArrow}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDocDropdownOpen((prev) => !prev);
                      }}
                    >
                      {isDocDropdownOpen ? "△" : "▽"}
                    </span>
                  )}
                </div>
                {/* Show submenu right below 문서 when dropdown is open */}
                {menu.hasDropdown && isDocDropdownOpen && (
  <ul className={styles.subMenu}>
    {/* 🟡 카테고리 추가 버튼을 최상단에 배치 */}
    <li
      className={styles.subMenuItem}
      onClick={() => {
        // 예: 모달 열기 또는 페이지 이동
        console.log("카테고리 추가 클릭");
      }}
    >
      + 카테고리 추가
    </li>

    {/* 기존 카테고리 목록 */}
    {documentSubmenus.map((submenu) => (
      <li
        key={submenu.label}
        className={`${styles.subMenuItem} ${
          isActive(submenu.path) ? styles.active : ""
        }`}
        onClick={() => navigate(submenu.path)}
      >
        {submenu.label}
      </li>
    ))}
  </ul>
)}

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
