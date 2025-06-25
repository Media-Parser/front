// 📁 src/lib/api/documentsApi.ts
// ✅ 문서 관련 백엔드 API 호출을 담당하는 함수 모음

import api from "./api";
import type { Document } from "../../types/documentType";

// ==================================================== 대시보드 ====================================================
// 유저별 문서 조회
export const getDocumentsApi = (user_id: string) =>
  api.get<Document[]>(`/documents/?user_id=${user_id}`);

// 문서 제목 수정
export const updateDocumentTitleApi = (doc_id: string, newTitle: string) => {
  return api.patch(`/documents/title/${doc_id}`, { title: newTitle });
};

// 문서 다운로드
export const downloadDocumentApi = (doc_id: string) =>
  api.get(`/documents/download/${doc_id}`, {
    responseType: "blob",
  });

// 문서 삭제
export const deleteDocumentApi = (doc_id: string) => api.delete(`/documents/${doc_id}`);

// 문서 업로드
export const uploadDocumentApi = (formData: FormData) =>
  api.post("/documents/upload", formData);

// 문서 읽기 (id 받아서 문서 데이터 반환)
export const readDocument = async (doc_id: string): Promise<Document> => {
  const res = await api.get<Document>(`/documents/${doc_id}`);
  return res.data;
};

// ==================================================== 휴지통 ====================================================
// 휴지통 문서 목록 조회
export const getTrashDocumentsApi = async (user_id: string) => {
  return await api.get(`/trash?user_id=${user_id}`);
};

// 휴지통 문서 복원
export const restoreDocumentApi = async (doc_id: string) => {
  return await api.post(`/trash/restore/${doc_id}`);
};

// 휴지통 문서 삭제 (개별)
export const deleteTrashDocumentApi = async (doc_id: string) => {
  return await api.delete(`/trash/${doc_id}`);
};

// 휴지통 문서 전체 삭제
export const deleteAllTrashDocumentsApi = async () => {
  return await api.delete(`/trash/all`);
};

// ==================================================== 카테고리 ====================================================
// 카테고리 조회
export const getCategoriesApi = async (user_id: string) => {
  return await api.get(`/categories/?user_id=${user_id}`);
};

// 카테고리 추가
export const addCategoryApi = async (user_id: string, label: string) => {
  return await api.post(`/categories`, { user_id, label });
};

// 카테고리 삭제
export const deleteCategoryApi = async (category_id: string) => {
  return await api.delete(`/categories/${category_id}`);
};

// 카테고리 수정
export const updateCategoryApi = async (category_id: string, label: string) => {
  return await api.put(`/categories/${category_id}`, { label });
};

// 카테고리 이동
export const moveDocumentApi = (doc_id: string, category_id: string) => {
  return api.post(`/categories/move/${doc_id}`, { category_id });
};

// ==================================================== 계정 ====================================================
// 계정 삭제 API (user_id 기준)
export const deleteUserApi = async (user_id: string) => {
  return await api.delete(`/users/${user_id}`);
};

// 사용자 정보 조회
export const getUserInfoApi = async (user_id: string) => {
  return await api.get(`/users/${user_id}`);
};
// ==================================================== 챗봇 에디터 ====================================================
// temp_docs 존재 여부 확인
export const checkTempDocExists = async (doc_id: string): Promise<{ exists: boolean }> => {
  const res = await api.get<{ exists: boolean }>(`/documents/temp/exists/${doc_id}`);
  return res.data;
};

// temp_docs에서 문서 조회
export const getTempDocApi = async (doc_id: string): Promise<Document> => {
  const res = await api.get<Document>(`/documents/temp/${doc_id}`);
  return res.data;
};

// docs(원본)에서 문서 조회
export const getDocApi = async (doc_id: string): Promise<Document|null> => {
  try {
    const res = await api.get<Document>(`/documents/${doc_id}`);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};
// export const getDocApi = async (docId: string): Promise<Document> => {
//   const res = await api.get<Document>(`/documents/${docId}`);
//   return res.data;
// };

// temp_docs patch(자동저장)
export const autosaveDocumentApi = async (
  doc_id: string,
  data: Partial<Document>
) => {
  return api.patch(`/documents/temp/${doc_id}`, data);
};

// 최종 저장
export const finalizeDocumentApi = async (doc_id: string) => {
  return await api.post(`/documents/finalize/${doc_id}`);
};

// ================================ 챗봇 ================================

// 1. 채팅 히스토리(문서별) 불러오기
export const getChatHistoryApi = async (doc_id: string) => {
  // ex: GET /api/chat/history/xxx
  const res = await api.get(`/chat/history/${doc_id}`);
  return res.data; // [{ sender, message, created_at }, ...]
};

// 2. 채팅 메시지 전송 (질문/답변 저장)
export const sendChatMessageApi = async (
  doc_id: string,
  message: string,
  article_content: string, // 에디터 최신 값
  user_id?: string         // 필요 시
) => {
  // ex: POST /api/chat/send
  const payload: any = { doc_id, message, article_content };
  if (user_id) payload.user_id = user_id;
  const res = await api.post(`/chat/send`, payload);
  return res.data; // { answer, created_at, ... }
};

// 3. (선택) 전체 채팅 삭제 (예: 대화방 리셋)
export const deleteChatHistoryApi = async (doc_id: string) => {
  // ex: DELETE /chat/history/xxx
  const res = await api.delete(`/chat/history/${doc_id}`);
  return res.data;
};

// 4. 챗봇의 수정 제안을 기사에 반영 (예: 본문 contents를 수정)
export const applyChatbotSuggestionApi = async (
  doc_id: string,
  suggestion: string, // 적용할 새 내용(본문, 일부 등)
  field: "contents" | "title" = "contents"
) => {
  // PATCH /documents/{doc_id}/apply-suggestion
  // (백엔드에서 실제로 이 엔드포인트를 구현해야 함)
  const res = await api.patch(`/documents/${doc_id}/apply-suggestion`, {
    field,
    suggestion,
  });
  return res.data; // 예: { success: true, updated: { ... } }
};
