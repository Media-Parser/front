import { useEffect, useState } from "react";
import styles from "./Chatbot.module.css";
import { Send } from "lucide-react";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore";

interface ApiResponse {
  chatbot_response: string;
  article_content?: string;
  confidence_score?: number;
  key_points?: string[];
  timestamp: string;
  session_id?: string;
}

interface ChatbotProps {
  docId: string;
}

const Chatbot = ({ docId }: ChatbotProps) => {
  const token = useAuthStore((state) => state.token);
  const fullMessage = "안녕하세요! 무엇을 도와드릴까요?";
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<
    { type: "user" | "bot"; text: string }[]
  >([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  const optionMessages: Record<string, string> = {
    "기사 제목 추천 받기": "이 기사 제목 추천해줘",
    "기사 톤 다듬기": "이 기사의 톤을 다듬어줘",
    "유사 기사 추천": "유사한 기사를 추천해줘",
    "다른 의견 듣기": "다른 의견을 알려줘",
  };

  const sendMessageToApi = async (message: string) => {
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    setShowOptions(false);
    setLoading(true);

    setChatLog((prev) => [...prev, { type: "user", text: message }]);

    const requestBody = {
      doc_id: docId,
      message,
      contain: false,
      session_id: sessionId ?? undefined,
    };

    try {
      const { data } = await axios.post<ApiResponse>(
        "http://52.15.42.56:8081/chat/send",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ API 응답 데이터:", data);
      const { chatbot_response, article_content, session_id } = data;

      if (session_id) setSessionId(session_id);

      setChatLog((prev) => [
        ...prev,
        { type: "bot", text: article_content || chatbot_response },
      ]);
      setUserInput("");
      setShowOptions(true);
    } catch (error) {
      console.error("API 요청 오류:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setShowOptions(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = async (option: string) => {
    const messageToSend = optionMessages[option];
    if (!messageToSend) {
      alert("잘못된 옵션입니다.");
      return;
    }
    await sendMessageToApi(messageToSend);
  };

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
        <h3 className={styles.defaultMessage}>
          <span className={styles.highlight}>기잣말싸미</span>에게 질문하세요.
        </h3>

        {chatLog.length === 0 && (
          <div className={styles.botMessage}>{displayedMessage}</div>
        )}

        {chatLog.map((chat, idx) => (
          <div
            key={idx}
            className={
              chat.type === "user" ? styles.userMessage : styles.botMessage
            }
          >
            {chat.text}
          </div>
        ))}

        {showOptions && !loading && (
          <div className={styles.options}>
            {Object.keys(optionMessages).map((option, idx) => (
              <button
                key={idx}
                className={styles.optionButton}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className={styles.botMessage}>응답을 기다리는 중...</div>
        )}
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="메시지를 입력하세요..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
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
