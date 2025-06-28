// src/types/chatType.ts
// 챗봇 타입 정의

// 채팅 히스토리
export interface ChatQA {
  chat_id: string;
  doc_id: string;
  question: string | ChatSendRequest; // 사용자가 보낸 질문
  answer: string; // AI가 생성한 답변
  suggestion?: string; // (optional) AI의 수정 제안
  created_dt: string;
}

// 채팅 히스토리 응답
export interface ChatHistoryResponse {
  history: ChatQA[];
}

// 채팅 전송 요청
export interface ChatSendRequest {
  doc_id: string;
  message: string; // 질문 (question)
  session_id?: string;
  selected_yn?: boolean; // 선택 영역 기준이면 true
  selected_text?: string; // (선택) 드래그된 텍스트 자체 (추천)
  start_index?: number; // (선택) 드래그 시작 인덱스
  end_index?: number; // (선택) 드래그 끝 인덱스
}

// 채팅 전송 응답
export interface ChatSendResponse {
  chat_id: string;
  doc_id: string;
  question: string;
  answer: string;
  suggestion?: string;
  created_dt: string;
  session_id?: string;
}
