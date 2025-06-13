// src/lib/api/documents_api.ts
import api from "./api";
import type { Document } from "../../types/documents_type";

export const getDocumentsApi = (user_id: string) =>
  api.get<Document[]>(`/documents?user_id=${user_id}`);

export const deleteDocumentApi = (id: string) =>
  api.delete(`/documents/${id}`);

export const uploadDocumentApi = (formData: FormData) =>
  api.post("/documents/upload", formData);

export const downloadDocumentApi = (id: string) =>
  api.get(`/documents/download/${id}`, {
    responseType: "blob",
  });
