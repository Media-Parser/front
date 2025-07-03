// 📁 src/components/Sidebar/Sidebar.tsx
import styles from "./Sidebar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { HiFolderAdd } from "react-icons/hi";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import { useCategories } from "../../hooks/useCategories";
import useAuthStore from "../../store/useAuthStore";
import { useGlobalFlagStore } from "../../store/useAuthStore";

interface Category {
  category_id: string;
  label: string;
  path: string;
}

interface SidebarProps {
  onRefetch?: () => void;
}

const Sidebar = ({ onRefetch }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAutoLogoutTriggered = useGlobalFlagStore(
    (s) => s.setAutoLogoutTriggered
  );

  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);

  const {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    fetchCategories,
  } = useCategories();

  // URL 변경에 따라 문서 드롭다운 열기 상태 동기화
  useEffect(() => {
    const isInCategory =
      location.pathname.startsWith("/dashboard/") &&
      location.pathname !== "/dashboard";
    setIsDocDropdownOpen(isInCategory);
  }, [location.pathname]);

  const topMenus = [
    { label: "문서", path: "/dashboard", hasDropdown: true },
    { label: "휴지통", path: "/trash" },
    { label: "계정", path: "/account" },
  ];

  const bottomMenus = [
    { label: "지원", path: "/support" },
    { label: "로그아웃", path: "/logout" },
  ];

  // 경로 일치 여부 체크
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const isActiveCategory = useCallback(
    (categoryPath: string) =>
      decodeURIComponent(location.pathname) === categoryPath,
    [location.pathname]
  );

  // 메뉴 클릭 처리
  const handleMenuClick = useCallback(
    async (menu: {
      label: string;
      path: string;
      hasDropdown?: boolean;
      isAddCategory?: boolean;
    }) => {
      if (menu.label === "로그아웃") {
        if (window.confirm("정말 로그아웃하시겠습니까?")) {
          setAutoLogoutTriggered(true);
          clearAuth();
          navigate("/");
        }
        return;
      }

      if (menu.isAddCategory) {
        await handleAddCategory();
        return;
      }

      if (menu.label === "문서") {
        navigate("/dashboard");
        return;
      }

      navigate(menu.path);
    },
    [clearAuth, navigate, setAutoLogoutTriggered]
  );

  // 새 카테고리 추가
  const handleAddCategory = useCallback(async () => {
    const name = prompt("새 카테고리 이름을 입력하세요.");
    if (!name) return;
    if (categories.some((c) => c.label === name)) {
      alert("이미 존재하는 카테고리입니다.");
      return;
    }

    const newCategory = await addCategory(name);
    if (!newCategory) return;

    await fetchCategories();
    onRefetch?.();

    if (newCategory.path) {
      const slug = newCategory.path.replace(/^\/dashboard\//, "");
      setTimeout(() => {
        navigate(`/dashboard/${slug}`, { replace: true });
      }, 100);
    }
  }, [addCategory, categories, fetchCategories, navigate, onRefetch]);

  // 카테고리 수정
  const handleEditCategory = useCallback(
    async (category: Category) => {
      const newLabel = prompt("새 카테고리 이름을 입력하세요.", category.label);
      if (newLabel && newLabel !== category.label) {
        await updateCategory(category.category_id, newLabel);
        await fetchCategories();
        onRefetch?.();
      }
    },
    [updateCategory, fetchCategories, onRefetch]
  );

  // 카테고리 삭제
  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      if (window.confirm("정말 삭제하시겠습니까?")) {
        await deleteCategory(category.category_id);
        await fetchCategories();
        onRefetch?.();
        if (location.pathname === category.path) {
          navigate("/dashboard", { replace: true });
        }
      }
    },
    [deleteCategory, fetchCategories, location.pathname, navigate, onRefetch]
  );

  // 카테고리 리스트 렌더링 분리
  const renderCategoryItem = (category: Category) => (
    <li
      key={category.category_id}
      className={`${styles.subMenuItem} ${
        isActiveCategory(category.path) ? styles.activemenu : ""
      }`}
      onClick={() => {
        if (category.path) {
          const slug = category.path.replace(/^\/dashboard\//, "");
          navigate(`/dashboard/${slug}`, { replace: true });
        }
      }}
    >
      <span className={styles.categoryLabel}>
        <span className={styles.subMenuBullet}>ㄴ</span>
        {category.label}
      </span>
      <div className={styles.categoryActions}>
        <button
          className={styles.categoryBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleEditCategory(category);
          }}
          aria-label={`Edit ${category.label}`}
        >
          <FaPen />
        </button>
        <button
          className={styles.categoryBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteCategory(category);
          }}
          aria-label={`Delete ${category.label}`}
        >
          <FaRegTrashAlt />
        </button>
      </div>
    </li>
  );

  return (
    <aside className={styles.sidebar}>
      {/* <Header /> */}
      <div className={styles.mainNav}>
        <nav>
          <ul>
            {topMenus.map((menu) => (
              <li key={menu.label}>
                <div
                  className={`${styles.menuItem} ${
                    isActive(menu.path)
                      ? styles.active
                      : menu.label === "문서" && isDocDropdownOpen
                      ? styles.openOnly
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
                        e.stopPropagation();
                        setIsDocDropdownOpen((prev) => !prev);
                      }}
                      aria-label={
                        isDocDropdownOpen ? "드롭다운 닫기" : "드롭다운 열기"
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsDocDropdownOpen((prev) => !prev);
                        }
                      }}
                    >
                      {isDocDropdownOpen ? "△" : "▽"}
                    </span>
                  )}
                </div>
                {menu.hasDropdown && isDocDropdownOpen && (
                  <ul
                    className={`${styles.subMenu} ${
                      isDocDropdownOpen &&
                      !location.pathname.startsWith("/dashboard")
                        ? styles.subMenuOpenOnly
                        : ""
                    }`}
                  >
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
                    {categories.map(renderCategoryItem)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={styles.bottomNav}>
        <div className={styles.separator} />
        <nav>
          <ul>
            {bottomMenus.map((menu) => (
              <li
                key={menu.label}
                className={`${styles.menuItem} ${
                  isActive(menu.path) ? styles.active : ""
                }`}
                onClick={() => handleMenuClick(menu)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMenuClick(menu);
                  }
                }}
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
