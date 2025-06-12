// src/lib/api/documents_api.ts
import axios from "axios";
import type { Document } from "../../types/documents_type";

export const getDocumentsApi = (user_id: string) =>
    axios.get<Document[]>(`/documents?user_id=${user_id}`);

export const deleteDocumentApi = (id: string) => axios.delete(`/documents/${id}`);
export const uploadDocumentApi = (formData: FormData) => axios.post("/documents/upload", formData);