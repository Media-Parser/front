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

export interface UserInfo {
  user_id: string;
  user_name: string;
  user_email: string;
  provider: string;
}

export interface ChatQA {
  chat_id: string;
  doc_id: string;
  question: string;
  answer: string;
  suggestion?: string;
  created_dt: string;
}
