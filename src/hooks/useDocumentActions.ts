// src/hooks/useDocumentActions.ts
// 설명: 삭제, 다운로드, 점수 평가 관련 액션들을 묶은 훅
// 이점: 다른 페이지에서도 같은 액션을 쉽게 사용할 수 있음
import axios from "axios";

export const useDocumentActions = (onSuccess?: () => void) => {
  const deleteDocument = async (id: string) => {
    if (!window.confirm("이 문서를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/documents/${id}`);
      onSuccess?.();
    } catch (error) {
      console.error("삭제 실패", error);
    }
  };

  const downloadDocument = (id: string) => {
    window.open(`/documents/${id}/download`, "_blank");
  };

  return { deleteDocument, downloadDocument };
};
