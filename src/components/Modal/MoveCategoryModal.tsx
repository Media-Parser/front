// src/components/Modal/MoveCategoryModal.tsx
import { useEffect, useState } from "react";
import {
  getCategoriesApi,
  moveDocumentApi,
} from "../../lib/api/documentsApi";
import type { Category } from "../../types/documentType";
import styles from "./MoveCategoryModal.module.css";
import useAuthStore from "../../store/useAuthStore";

interface MoveCategoryModalProps {
  docId: string;
  originCategoryId?: string; // 현재 문서의 카테고리 id (없으면 undefined/빈 문자열)
  onClose: () => void;
  onMoved?: () => void;
}

const MoveCategoryModal = ({
  docId,
  originCategoryId = "", // 기본값 빈 문자열
  onClose,
  onMoved,
}: MoveCategoryModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(originCategoryId);
  const [loading, setLoading] = useState(false);
  const userId = useAuthStore((state) => state.userId);

  // 1. body 스크롤 잠금
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    getCategoriesApi(userId).then((res) => {
      setCategories(res.data as Category[]);
    });
  }, []);

  // originCategoryId prop 변경 시 select 값 동기화
  useEffect(() => {
    setSelectedCategory(originCategoryId ?? "");
  }, [originCategoryId]);

  const handleMove = async () => {
    if (selectedCategory === originCategoryId) return; // 바뀐 게 없으면 무시
    setLoading(true);
    try {
      await moveDocumentApi(docId, selectedCategory); // ""도 OK!
      onMoved?.();
      onClose();
    } catch (err) {
      alert("카테고리 이동에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={styles.categoryModalOverlay}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        tabIndex={-1}
        aria-label="모달 배경"
      />
      <div
        className={styles.categoryModal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.categoryModalTitle}>문서 카테고리 선택</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.categoryModalSelect}
        >
          <option value="">-- 카테고리 없음 --</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.label}
            </option>
          ))}
        </select>
        <div className={styles.categoryModalButtonContainer}>
          <button
            onClick={handleMove}
            disabled={loading || selectedCategory === originCategoryId}
            className={styles.categoryModalMoveButton}
          >
            이동
          </button>
          <button
            onClick={onClose}
            className={styles.categoryModalCancelButton}
          >
            취소
          </button>
        </div>
      </div>
    </>
  );
};

export default MoveCategoryModal;
