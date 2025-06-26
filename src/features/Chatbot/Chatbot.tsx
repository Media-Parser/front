// features/Chatbot/Chatbot.tsx
// 이 컴포넌트는 사용자가 챗봇과 상호작용할 수 있는 UI를 제공합니다.

import { useEffect, useState } from "react";
import styles from "./Chatbot.module.css";
import { Send } from "lucide-react";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore";
import logo from "../../assets/pol.png";

// API 응답 타입 정의
interface ApiResponse {
  chatbot_response: string;
  article_content?: string;
  confidence_score?: number;
  key_points?: string[];
  timestamp: string;
  session_id?: string;
}

// 컴포넌트 Props 타입
interface ChatbotProps {
  docId: string;
}

const Chatbot = ({ docId }: ChatbotProps) => {
  // 로그인 토큰 가져오기 (Zustand store 사용)
  const token = useAuthStore((state) => state.token);

  // 초기 인사 메시지 관련 상태
  const fullMessage = "안녕하세요! 무엇을 도와드릴까요?";
  const [displayedMessage, setDisplayedMessage] = useState(""); // 타이핑 효과용
  const [showOptions, setShowOptions] = useState(false); // 옵션 버튼 보일지 여부
  const [hasShownOptionsOnce, setHasShownOptionsOnce] = useState(false); // 옵션 한 번만 표시용

  // 입력 및 채팅 기록 상태
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<
    { type: "user" | "bot"; text: string }[]
  >([]);

  // 챗봇 세션 및 로딩 상태
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 초기 인사말 타이핑 효과
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      const nextChar = fullMessage.charAt(index);
      if (!nextChar) {
        clearInterval(typingInterval);
        // 타이핑 완료 후 옵션 버튼 잠시 후 표시
        setTimeout(() => setShowOptions(true), 300);
        return;
      }
      setDisplayedMessage((prev) => prev + nextChar);
      index++;
    }, 50);
    return () => clearInterval(typingInterval);
  }, []);

  // 옵션 버튼 → 사용자 요청 메시지 매핑
  const optionMessages: Record<string, string> = {
    "기사 제목 추천 받기": "이 기사 제목 추천해줘",
    "기사 톤 다듬기": "이 기사의 톤을 다듬어줘",
    "유사 기사 추천": "유사한 기사를 추천해줘",
    "다른 의견 듣기": "다른 의견을 알려줘",
  };

  // 메시지를 챗봇 API로 전송
  const sendMessageToApi = async (message: string) => {
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    // 옵션 숨기고 로딩 시작
    setShowOptions(false);
    setLoading(true);
    setHasShownOptionsOnce(true); // 옵션은 한 번만 표시

    // 사용자 메시지 로그 추가
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

      const { chatbot_response, article_content, session_id } = data;

      // 세션 ID 저장 (있으면)
      if (session_id) setSessionId(session_id);

      // 챗봇 응답을 로그에 추가
      setChatLog((prev) => [
        ...prev,
        { type: "bot", text: article_content || chatbot_response },
      ]);

      // 입력창 초기화 및 옵션 다시 표시
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

  // 옵션 버튼 클릭 핸들러
  const handleOptionClick = async (option: string) => {
    const messageToSend = optionMessages[option];
    if (!messageToSend) {
      alert("잘못된 옵션입니다.");
      return;
    }
    await sendMessageToApi(messageToSend);
  };

  // 수동 입력 전송 핸들러
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
        {/* 헤더 메시지 */}
        <h3 className={styles.defaultMessage}>
          {" "}
          <img src={logo} alt="로고" className={styles.logo} />
          에게 질문하세요.
        </h3>

        {/* 초기 인사 메시지 */}
        {chatLog.length === 0 && (
          <div className={styles.botMessage}>{displayedMessage}</div>
        )}

        {/* 채팅 로그 출력 */}
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

        {/* 옵션 버튼: 처음 한 번만 표시 */}
        {showOptions && !loading && !hasShownOptionsOnce && (
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

        {/* 응답 대기 중 메시지 */}
        {loading && (
          <div className={styles.botMessage}>응답을 기다리는 중...</div>
        )}
      </div>

      {/* 입력창 영역 */}
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
