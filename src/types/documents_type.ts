// 
export interface Document {
  _id: string; // DB에서 온 실제 ObjectId
  id?: string; // 필요시 string으로 변환된 id
  title?: string;
  filename?: string;
  date?: string; // 날짜 필드는 필요에 따라 추가
  file_type?: string; // 파일 타입
  score?: number; // 등등
  // 나머지 필드...
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
