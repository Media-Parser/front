// features/Chatbot/Chatbot.tsx

import { useEffect, useState } from "react";
import styles from "./Chatbot.module.css";
import { Send } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { fetchChatHistoryApi, sendChatMessageApi } from "../../lib/api/aiApi";
import type { ChatSendRequest, ChatQA } from "../../types/chatType";

// (필요 없다면 제거)
// interface ChatbotProps { docId: string; }
type ChatbotProps = { docId: string; };

const Chatbot = ({ docId }: ChatbotProps) => {
  const token = useAuthStore((state) => state.token);

  // UI 상태들
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [hasShownOptionsOnce, setHasShownOptionsOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatQA[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // 옵션 버튼 → 메시지 변환
  const optionMessages: Record<string, string> = {
    "기사 제목 추천 받기": "이 기사 제목 추천해줘",
    "기사 톤 다듬기": "이 기사의 톤을 다듬어줘",
    "유사 기사 추천": "유사한 기사를 추천해줘",
    "다른 의견 듣기": "다른 의견을 알려줘",
  };

  // 타이핑 효과 (처음 1회)
  useEffect(() => {
    const fullMessage = "안녕하세요! 무엇을 도와드릴까요?";
    let index = 0;
    const typingInterval = setInterval(() => {
      const nextChar = fullMessage.charAt(index);
      if (!nextChar) {
        clearInterval(typingInterval);
        setTimeout(() => setShowOptions(true), 300);
        return;
      }
      setDisplayedMessage((prev) => prev + nextChar);
      index++;
    }, 50);
    return () => clearInterval(typingInterval);
  }, []);

  // 히스토리 불러오기
  useEffect(() => {
    fetchChatHistoryApi(docId)
      .then((history) => setChatLog(history))
      .catch(() => setChatLog([]));
  }, [docId]);

  // 메시지 보내기
  const sendMessageToApi = async (message: string) => {
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    setShowOptions(false);
    setLoading(true);
    setHasShownOptionsOnce(true);

    // Q: 임시 chat_id 유니크하게 idx도 추가
    setChatLog((prev) => [
      ...prev,
      {
        chat_id: `temp_${Date.now()}_${prev.length}`,
        doc_id: docId,
        question: message,
        answer: "",
        created_dt: new Date().toISOString(),
      },
    ]);
    const req: ChatSendRequest = {
      doc_id: docId,
      message,
      session_id: sessionId,
    };
    try {
      const res = await sendChatMessageApi(req);
      setSessionId(res.session_id);
      setChatLog((prev) => [
        ...prev.filter((q) => !(q.question === message && q.answer === "")),
        res,
      ]);
      setUserInput("");
      setShowOptions(true);
      setError(null);
    } catch (e) {
      setError("❌ 응답에 실패했습니다. 다시 시도해 주세요.");
      // 답변이 없는 빈 botMessage로 남지 않게 임시 Q를 유지
      setChatLog((prev) => prev.map((chat, i) =>
        (i === prev.length - 1 && chat.answer === "") ?
          { ...chat, answer: "" } : chat
      ));
      setShowOptions(true);
    } finally {
      setLoading(false);
    }
  };

  // 옵션 버튼 핸들러
  const handleOptionClick = async (option: string) => {
    const messageToSend = optionMessages[option];
    if (!messageToSend) {
      alert("잘못된 옵션입니다.");
      return;
    }
    await sendMessageToApi(messageToSend);
  };

  // 입력 전송 핸들러
  const handleSend = async () => {
    if (!userInput.trim()) {
      alert("질문을 입력하세요.");
      return;
    }
    await sendMessageToApi(userInput.trim());
  };

  return (
    <div className={styles.Wrapper}>
      <div className={styles.chatMessages}>
        {/* 헤더 */}
        <h3 className={styles.defaultMessage}>
          <span className={styles.highlight}>기잣말싸미</span>에게 질문하세요.
        </h3>
        {/* 첫 인사 */}
        {chatLog.length === 0 && (
          <div className={styles.botMessage}>{displayedMessage}</div>
        )}

        {/* 채팅 로그 */}
        {chatLog.map((chat, idx) => (
          <div key={chat.chat_id || `${chat.question}-${idx}`} className={styles.chatLog}>
            <div className={styles.userMessage}>{chat.question}</div>
            {/* 마지막 메시지에만 로딩/에러 */}
            {idx === chatLog.length - 1 ? (
              error ? (
                <div className={styles.errorMessage}>{error}</div>
              ) : loading ? (
                <div className={styles.botMessage}>응답을 기다리는 중...</div>
              ) : (
                <div className={styles.botMessage}>{chat.answer}</div>
              )
            ) : (
              <div className={styles.botMessage}>{chat.answer}</div>
            )}
            {chat.suggestion && (
              <div className={styles.suggestion}>제안: {chat.suggestion}</div>
            )}
          </div>
        ))}

        {/* 옵션 버튼 그룹 */}
        {showOptions && !loading && !hasShownOptionsOnce && (
          <div className={styles.options}>
            {Object.keys(optionMessages).map((option) => (
              <button
                key={option}
                className={styles.optionButton}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 입력창 */}
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="메시지를 입력하세요..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading}
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={loading}
          aria-label="send message"
        >
          <Send />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
