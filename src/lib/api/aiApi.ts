// src/lib/api/aiApi.ts
import { aiApi, api } from "./api";
import type {
  ChatQA,
  ChatHistoryResponse,
  ChatSendRequest,
  ChatSendResponse,
} from "../../types/chatType";

/** 1. 채팅 히스토리(문서별) 불러오기 */
export const fetchChatHistoryApi = async (
    doc_id: string
  ): Promise<ChatQA[]> => {
    const res = await api.get<ChatHistoryResponse>(`/chat/history/${doc_id}`);
    return res.data.history ?? res.data;
  };

/** 2. 채팅 메시지 보내기 */
export const sendChatMessageApi = async (
  data: ChatSendRequest
): Promise<ChatSendResponse> => {
  const res = await aiApi.post<ChatSendResponse>(`/chat/send`, data);
  return res.data;
};

/** 3. (선택) 전체 채팅 삭제 (예: 대화방 리셋) */
export const deleteChatHistoryApi = async (doc_id: string) => {
  await api.delete(`/chat/history/${doc_id}`);
};

/** 4. 챗봇의 수정 제안을 기사에 반영 (예: 본문 contents를 수정) */
export const patchArticleContentApi = async (
  doc_id: string,
  content: string,
) => {
  await aiApi.patch(`/chat/article/${doc_id}`, { content });
};
