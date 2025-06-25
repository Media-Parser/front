import { useEffect, useState } from "react";
import styles from "./Chatbot.module.css";
import { Send } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import {
  getChatHistoryApi,
  sendChatMessageApi,
  applyChatbotSuggestionApi,
} from "../../lib/api/documentsApi";

interface ChatMessage {
  sender: "user" | "bot";
  message: string;
  created_at: string;
  suggestion?: string; // 챗봇이 수정 제안 줄 때 포함
}

interface ChatbotProps {
  docId: string;
  contents: string;
  setContents: (text: string) => void;
}

const Chatbot = ({ docId, contents, setContents }: ChatbotProps) => {
  const token = useAuthStore((state) => state.token);

  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyLoadingIdx, setApplyLoadingIdx] = useState<number | null>(null); // 제안 반영 중인 메시지 인덱스

  // 2. 입장시 히스토리 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getChatHistoryApi(docId) as ChatMessage[];
        setChatLog(data);
      } catch {
        setChatLog([]);
      }
    };
    if (docId) fetchHistory();
  }, [docId]);

  // 3. 메시지 전송
  const handleSend = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    // optimistic update
    setChatLog((prev) => [
      ...prev,
      { sender: "user", message: userInput, created_at: new Date().toISOString() }
    ]);

    try {
      // sendChatMessageApi를 이용 (documentsApi에 있음)
      const res = await sendChatMessageApi(docId, userInput, contents);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "bot",
          message: res.answer,
          created_at: res.created_at,
          ...(res.suggestion && { suggestion: res.suggestion }),
        }
      ]);
    } catch {
      alert("채팅 전송 중 오류가 발생했습니다.");
    } finally {
      setUserInput("");
      setLoading(false);
    }
  };

  // 옵션 버튼(예시)
  const optionMessages: Record<string, string> = {
    "기사 제목 추천 받기": "이 기사 제목 추천해줘",
    "기사 톤 다듬기": "이 기사의 톤을 다듬어줘",
    "유사 기사 추천": "유사한 기사를 추천해줘",
    "다른 의견 듣기": "다른 의견을 알려줘",
  };
  const handleOptionClick = (option: string) => {
    setUserInput(optionMessages[option]);
    setTimeout(handleSend, 100); // 자동 전송
  };

  // 4. 제안 반영 함수
  const handleApplySuggestion = async (idx: number, suggestion: string) => {
    setApplyLoadingIdx(idx);
    try {
      const res = await applyChatbotSuggestionApi(docId, suggestion, "contents");
      setContents(res.updated.contents); // 에디터에 바로 반영
      alert("수정 제안이 성공적으로 반영되었습니다.");
    } catch {
      alert("수정 제안 반영에 실패했습니다.");
    }
    setApplyLoadingIdx(null);
  };

  return (
    <div className={styles.Wrapper}>
      <div className={styles.chatMessages}>
        {/* 헤더 메시지 */}
        <h3 className={styles.defaultMessage}>
          <span className={styles.highlight}>기잣말싸미</span>에게 질문하세요.
        </h3>

        {/* 채팅 로그 출력 */}
        {chatLog.length === 0 && (
          <div className={styles.botMessage}>안녕하세요! 무엇을 도와드릴까요?</div>
        )}
        {chatLog.map((chat, idx) => (
          <div key={idx} className={chat.sender === "user" ? styles.userMessage : styles.botMessage}>
            {/* 메시지 본문 */}
            {chat.message}
            {/* 만약 suggestion 필드가 있으면, 제안 및 반영 버튼 표시 */}
            {chat.suggestion && (
              <div style={{ marginTop: "10px" }}>
                <div
                  style={{
                    background: "#f4f7ff",
                    padding: "10px",
                    borderRadius: "8px",
                    marginBottom: "6px",
                    fontSize: "0.95em"
                  }}
                >
                  <b>수정 제안:</b>
                  <pre style={{ whiteSpace: "pre-wrap" }}>{chat.suggestion}</pre>
                </div>
                <button
                  onClick={() => handleApplySuggestion(idx, chat.suggestion!)}
                  disabled={applyLoadingIdx === idx}
                >
                  {applyLoadingIdx === idx ? "반영 중..." : "이대로 반영"}
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && <div className={styles.botMessage}>응답을 기다리는 중...</div>}
      </div>

      {/* 옵션 버튼 */}
      <div className={styles.options}>
        {Object.keys(optionMessages).map((option, idx) => (
          <button
            key={idx}
            className={styles.optionButton}
            onClick={() => handleOptionClick(option)}
            disabled={loading}
          >
            {option}
          </button>
        ))}
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
