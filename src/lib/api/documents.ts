import axios from "axios";

export const getDocuments = () => axios.get("/documents");
export const deleteDocument = (id: string) => axios.delete(`/documents/${id}`);
export const uploadDocument = (formData: FormData) => axios.post("/upload", formData);