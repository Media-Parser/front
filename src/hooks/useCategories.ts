// 📁 src/hooks/useCategories.ts
import { useEffect, useState } from "react";
import type { Category } from "../types/documentType";
import {
  getCategoriesApi,
  addCategoryApi,
  deleteCategoryApi,
  updateCategoryApi,
} from "../lib/api/documentsApi";
import useAuthStore from "../store/useAuthStore";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const userId = useAuthStore((state) => state.userId);

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      if (!userId) return [];
      const res = await getCategoriesApi(userId);
      setCategories(res.data as Category[]);
      setLoaded(true);
      return res.data as Category[];
    } catch (error) {
      console.error("카테고리 불러오기 실패", error);
      setLoaded(true);
      return [];
    }
  };

  const addCategory = async (name: string): Promise<Category | null> => {
    if (!userId) return null;
    try {
      const res = await addCategoryApi(userId, name);
      await fetchCategories();
      return res.data as Category;
    } catch (error) {
      console.error("카테고리 추가 실패", error);
      return null;
    }
  };

  const deleteCategory = async (category_id: string) => {
    if (!userId) return;
    try {
      await deleteCategoryApi(category_id);
      await fetchCategories();
    } catch (error) {
      console.error("카테고리 삭제 실패", error);
    }
  };

  const updateCategory = async (
    category_id: string,
    label: string
  ): Promise<Category | null> => {
    if (!userId) return null;
    try {
      await updateCategoryApi(category_id, label); // 업데이트
      const res = await getCategoriesApi(userId); // 다시 전체 fetch
      const data = res.data as Category[];
      setCategories(data); // 상태 동기화
      // ⭐ 바로 여기서 data에서 반환
      const updated = data.find((c) => c.category_id === category_id) ?? null;
      console.log(
        "🟢 [useCategories] after updateCategory - updated:",
        updated
      );
      return updated;
    } catch (error) {
      console.error("카테고리 수정 실패", error);
      return null;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    fetchCategories,
    loaded,
  };
};
