// src/types/DocumentType.ts
// 문서 타입 정의
export interface Document {
  doc_id: string; // DB에서 온 실제 ObjectId
  user_id: string; // 필요시 string으로 변환된 id
  title?: string;
  contents?: string;
  created_dt?: string; // 날짜 필드는 필요에 따라 추가
  updated_dt?: string;
  file_type?: string; // 파일 타입
  category_id?: string; // 문서 카테고리
  category: string;
  delete_yn?: string; // 삭제 여부
}

// 카테고리 타입 정의
export interface Category {
  category_id: string;
  label: string;
  path: string;
  user_id: string;
  created_dt?: string;
  updated_dt?: string;
}

// DocumentCardProps
export interface DocumentCardProps {
  title: string;
  date: string;
  doc_id: string;
  category_id: string;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  download?: boolean;
  remove?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onMoved?: () => void;
  onRightClick?: () => void;
}

// 문서 업로드 응답
export interface UploadResponse {
  documentId: string;
  message: string;
}

// 문서 삭제 응답
export interface DeleteResponse {
  success: boolean;
  message?: string;
}

export interface UserInfo {
  user_id: string;
  user_name: string;
  user_email: string;
  provider: string;
}
