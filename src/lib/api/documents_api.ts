// src/lib/api/documents_api.ts
import api from "./api";
import type { Document } from "../../types/documents_type";

// 유저별 문서 조회
export const getDocumentsApi = (user_id: string) =>
  api.get<Document[]>(`/documents?user_id=${user_id}`);

// 문서 삭제
export const deleteDocumentApi = (id: string) =>
  api.delete(`/documents/${id}`);

// 문서 업로드
export const uploadDocumentApi = (formData: FormData) =>
  api.post("/documents/upload", formData);

// 문서 다운로드
export const downloadDocumentApi = (id: string) =>
  api.get(`/documents/download/${id}`, {
    responseType: "blob",
  });

// 휴지통 문서 목록 조회
export const getTrashDocumentsApi = async (user_id: string) => {
  return await api.get(`/trash?user_id=${user_id}`);
};

// 휴지통 문서 복원
export const restoreDocumentApi = async (document_id: string) => {
  return await api.post(`/trash/restore/${document_id}`);
};

// 휴지통 문서 삭제 (개별)
export const deleteTrashDocumentApi = async (document_id: string) => {
  return await api.delete(`/trash/${document_id}`);
};

// 휴지통 문서 전체 삭제
export const deleteAllTrashDocumentsApi = async () => {
  return await api.delete(`/trash/all`);
};

// 사용자 정보 조회
export const getUserInfoApi = async (user_id: string) => {
  return await api.get(`/users/${user_id}`);
};