import axios from "axios";
import type { Document } from "../types/documents";

const API_BASE = "http://your-backend-api.com/api"; // 실제 주소로 변경

export const fetchDocuments = (deleted = false) => {
  return axios.get<Document[]>(`${API_BASE}/documents?deleted=${deleted}`);
};

export const updateDeleteYn = (id: string, deleteYn: boolean) => {
  return axios.patch(`${API_BASE}/documents/${id}`, { delete_yn: deleteYn });
};

export const deleteDocumentPermanently = (id: string) => {
  return axios.delete(`${API_BASE}/documents/${id}`);
};
