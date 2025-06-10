export interface Document {
    id: string;
    title: string;
    date: string;
    score?: number;
    download?: boolean;
    remove?: boolean;
  }
  
  export interface UploadResponse {
    documentId: string;
    message: string;
  }
  
  export interface DeleteResponse {
    success: boolean;
    message?: string;
  }
  
  export interface DocumentDetail {
    id: string;
    title: string;
    date: string;
    content: string;
    author?: string;
  }
  