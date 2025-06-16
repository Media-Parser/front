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
    { label: "카테고리 추가", path: "/dashboard" },
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
    if (menu.label === "로그아웃") {
      if (window.confirm("정말 로그아웃하시겠습니까?")) {
        localStorage.removeItem("user_id");
        localStorage.removeItem("access_token");
        navigate("/");
      }
      return;
    }

    // '문서' 라벨 클릭 시 드롭다운 토글 없이 이동만
    if (menu.hasDropdown) {
      if (menu.label === "문서") {
        navigate(menu.path);
      }
      // 다른 드롭다운 메뉴가 있다면 여기서 토글 가능 (지금은 없으니 생략)
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
                    onClick={() => handleMenuClick(menu)}
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
                {menu.hasDropdown && isDocDropdownOpen && (
                  <ul className={styles.subMenu}>
                    {documentSubmenus.map((submenu) => (
                      <li
                        key={submenu.label}
                        className={`${styles.subMenuItem} ${
                          isActive(submenu.path) ? styles.activemenu : ""
                        }`}
                        onClick={() => handleMenuClick(submenu)}
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
