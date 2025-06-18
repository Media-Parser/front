import styles from "./Sidebar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiFolderAdd } from "react-icons/hi";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import { useCategories } from "../../hooks/useCategories";

interface SidebarProps {
  onRefetch?: () => void;
}

const Sidebar = ({ onRefetch }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false); // 초기 false

  useEffect(() => {
    // /dashboard/로 시작하지만 정확히 /dashboard는 아님
    const isInCategory =
      location.pathname.startsWith("/dashboard/") &&
      location.pathname !== "/dashboard";
    setIsDocDropdownOpen(isInCategory);
  }, [location.pathname]);

  const {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    fetchCategories,
  } = useCategories();

  const topMenus = [
    { label: "문서", path: "/dashboard", hasDropdown: true },
    { label: "휴지통", path: "/trash" },
    { label: "계정", path: "/account" },
  ];

  const bottomMenus = [
    { label: "지원", path: "/support" },
    { label: "로그아웃", path: "/logout" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isActiveCategory = (categoryPath: string) =>
    decodeURIComponent(location.pathname) === categoryPath;

  const handleMenuClick = async (menu: {
    label: string;
    path: string;
    hasDropdown?: boolean;
    isAddCategory?: boolean;
  }) => {
    if (menu.label === "로그아웃") {
      if (window.confirm("정말 로그아웃하시겠습니까?")) {
        localStorage.removeItem("user_id");
        localStorage.removeItem("access_token");
        navigate("/");
      }
      return;
    }

    if (menu.isAddCategory) {
      await handleAddCategory();
      return;
    }

    if (menu.label === "문서") {
      navigate("/dashboard"); // 드롭다운 토글 안 함
      return;
    }

    navigate(menu.path);
  };

  const handleAddCategory = async () => {
    const name = prompt("새 카테고리 이름을 입력하세요.");
    if (!name) return;
    if (categories.some((c) => c.label === name)) {
      alert("이미 존재하는 카테고리입니다.");
      return;
    }
    await addCategory(name);
    await fetchCategories();
    onRefetch?.();
  };

  const handleEditCategory = async (category: any) => {
    const newLabel = prompt("새 카테고리 이름을 입력하세요.", category.label);
    if (newLabel && newLabel !== category.label) {
      await updateCategory(category.category_id, newLabel);
      await fetchCategories();
      onRefetch?.();
    }
  };

  const handleDeleteCategory = async (category: any) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deleteCategory(category.category_id);
      await fetchCategories();
      onRefetch?.();
      if (location.pathname === category.path) {
        navigate("/dashboard", { replace: true });
      }
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.mainNav}>
        <nav>
          <ul>
            {topMenus.map((menu) => (
              <li key={menu.label}>
                <div
                  className={`${styles.menuItem} ${
                    (menu.label === "문서" && isDocDropdownOpen) ||
                    isActive(menu.path)
                      ? styles.active
                      : ""
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
                        e.stopPropagation(); // 클릭 이벤트 전파 막기
                        setIsDocDropdownOpen((prev) => !prev);
                      }}
                    >
                      {isDocDropdownOpen ? "△" : "▽"}
                    </span>
                  )}
                </div>
                {menu.hasDropdown && isDocDropdownOpen && (
                  <ul className={styles.subMenu}>
                    <li
                      key="add-category"
                      className={`${styles.subMenuItem} ${styles.addCategoryItem}`}
                      onClick={handleAddCategory}
                    >
                      <HiFolderAdd className={styles.icon} />
                      <span className={styles.addCategoryLabel}>
                        새 카테고리
                      </span>
                    </li>
                    {categories.map((category) => (
                      <li
                        key={category.category_id}
                        className={`${styles.subMenuItem} ${
                          isActiveCategory(category.path)
                            ? styles.activemenu
                            : ""
                        }`}
                        onClick={() => {
                          if (category.path) {
                            const slug = category.path.replace(
                              /^\/dashboard\//,
                              ""
                            );
                            navigate(`/dashboard/${slug}`, { replace: true });
                          }
                        }}
                      >
                        <span className={styles.categoryLabel}>
                          {category.label}
                        </span>
                        <div className={styles.categoryActions}>
                          <button
                            className={styles.categoryBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                          >
                            <FaPen />
                          </button>
                          <button
                            className={styles.categoryBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category);
                            }}
                          >
                            <FaRegTrashAlt />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={styles.bottomNav}>
        <div className={styles.separator}></div>
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
