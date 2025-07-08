// features/Chatbot/Chatbot.tsx
import { useEffect, useRef, useState } from "react";
import styles from "./Chatbot.module.css";
import { Send } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import {
  fetchChatHistoryApi,
  sendChatMessageApi,
  deleteChatHistoryApi,
} from "../../lib/api/aiApi";
import type { ChatSendRequest, ChatQA } from "../../types/chatType";
import { Eraser } from "lucide-react";
import logo from "../../assets/a.png";
import pPro from "../../assets/go.png";

interface ChatbotProps {
  docId: string;
  selectedTextData?: {
    selectedText: string | null;
    startIndex: number;
    endIndex: number;
  } | null;
  onMessageSent?: () => void;
  onClearSelectedText?: () => void;
  setEditorTitle?: React.Dispatch<React.SetStateAction<string>>;
  setEditorBody?: React.Dispatch<React.SetStateAction<string>>;
  autosave?: (data: { title: string; contents: string }) => Promise<void>;
  title: string;
  contents: string;
}

const Chatbot = ({
  docId,
  selectedTextData,
  onMessageSent,
  onClearSelectedText,
  setEditorTitle,
  setEditorBody,
  autosave,
  title,
  contents,
}: ChatbotProps) => {
  const token = useAuthStore((state) => state.token);

  const [displayedMessage, setDisplayedMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [hasShownOptionsOnce, setHasShownOptionsOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatQA[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // 옵션 버튼 → 메시지 변환
  const optionMessages: Record<string, string> = {
    "기사 제목 추천 받기": "이 기사의 내용을 보고 어울리만한 제목으로 추천해줘",
    "기사 톤 다듬기": "이 기사의 톤을 다듬어줘",
    "유사 기사 추천": "이 기사의 내용을 보고 유사한 기사를 추천해줘",
  };

  // 채팅 메시지 스크롤
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatLog, loading]);

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
      .then((history) => {
        setChatLog(history);
      })
      .catch(() => setChatLog([]));
  }, [docId]);

  // 선택된 텍스트 자동 입력
  useEffect(() => {
    if (selectedTextData && selectedTextData.selectedText) {
      inputRef.current?.focus();
    }
  }, [selectedTextData]);

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
      selected_yn: !!selectedTextData?.selectedText,
      selected_text: selectedTextData?.selectedText || "",
      start_index: selectedTextData?.startIndex ?? -1,
      end_index: selectedTextData?.endIndex ?? -1,
    };
    try {
      const res = await sendChatMessageApi(req);
      setChatLog((prev) => [
        ...prev.filter((q) => !(q.question === message && q.answer === "")),
        res,
      ]);
      setUserInput("");
      setShowOptions(true);
      setError(null);
      if (onMessageSent) onMessageSent();
    } catch (e) {
      setError("응답에 실패했습니다. 다시 시도해 주세요.");
      setChatLog((prev) =>
        prev.map((chat, i) =>
          i === prev.length - 1 && chat.answer === ""
            ? { ...chat, answer: "" }
            : chat
        )
      );
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

  // 대화방 초기화 핸들러
  const handleResetChat = async () => {
    if (!window.confirm("정말 대화방을 초기화하시겠습니까?")) return;
    try {
      await deleteChatHistoryApi(docId);
      setChatLog([]); // 채팅 로그도 초기화
      setError(null);
      setUserInput("");
      setShowOptions(true);
      setHasShownOptionsOnce(false);
      alert("대화방이 초기화되었습니다.");
    } catch (e) {
      alert("대화방 리셋에 실패했습니다.");
    }
  };

  // 복사 핸들러
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("복사되었습니다!");
  };

  // 적용 핸들러
  const handleApply = async (
    text: string,
    type?: "title" | "body",
    startIndex?: number,
    endIndex?: number
  ) => {
    if (window.confirm("이 내용을 적용할까요?")) {
      let newTitle = title;
      let newContents = contents;
      if (type === "title" && typeof setEditorTitle === "function") {
        setEditorTitle(text);
        newTitle = text;
      } else if (type === "body" && typeof setEditorBody === "function") {
        if (
          typeof startIndex === "number" &&
          typeof endIndex === "number" &&
          startIndex >= 0 &&
          endIndex > startIndex
        ) {
          newContents =
            contents.slice(0, startIndex) + text + contents.slice(endIndex);
          setEditorBody(newContents);
        } else {
          alert("자동 적용이 불가능합니다. 원하는 위치에 직접 붙여넣어 주세요.");
          handleCopy(text);
          return;
        }
      }
      // 적용 즉시 임시저장까지
      if (typeof autosave === "function") {
        await autosave({ title: newTitle, contents: newContents });
      }
      if (typeof onClearSelectedText === "function") {
        onClearSelectedText();
      }
    }
  };

  // 페이지 이탈 경고 (로딩 중일 때)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    if (loading) {
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [loading]);

  return (
    <div className={styles.Wrapper}>
      <div className={styles.chatHeaderArea}>
        <h3 className={styles.defaultMessage}>
          <img src={logo} alt="로고" className={styles.logo} />
        </h3>
        <button className={styles.resetButton} onClick={handleResetChat}>
          <Eraser strokeWidth={1.2} />
        </button>
      </div>
      <div className={styles.chatMessages} ref={chatMessagesRef}>
        {/* 첫 인사 */}
        {chatLog.length === 0 && (
          <div className={styles.botIntroContainer}>
            <img src={pPro} alt="로고" className={styles.botlogo} />
            <div className={styles.botMessage}>{displayedMessage}</div>
          </div>
        )}

        {/* 채팅 로그 */}
        {chatLog.map((chat, idx) => {
          const isLast = idx === chatLog.length - 1;
          let selectedText = "";
          if (typeof chat.question !== "string" && chat.question?.selected_text) {
            selectedText = chat.question.selected_text;
          }
          return (
            <div
              key={
                chat.chat_id ||
                `${
                  typeof chat.question === "string"
                    ? chat.question
                    : chat.question?.message
                }-${idx}`
              }
              className={styles.chatLog}
            >
              {/* 드래그(선택)한 내용 표시 */}
              {selectedText && (
                <div className={styles.selectedTextBoxInLog}>
                  <span className={styles.selectedTextIcon}>↳</span>
                  <span className={styles.selectedText}>{selectedText}</span>
                </div>
              )}

              {/* 사용자 메시지 */}
              <div className={styles.userMessage}>
                {typeof chat.question === "string"
                  ? chat.question
                  : chat.question && "message" in chat.question
                  ? chat.question.message
                  : ""}
              </div>

              {/* 봇 메시지 or 에러 메시지 */}
              {isLast && error ? (
                <div className={styles.errorMessage}>{error}</div>
              ) : (
                <div className={styles.botIntroContainer}>
                  <img
                    src={pPro}
                    alt="bot profile"
                    className={styles.botlogo}
                  />
                  <div className={styles.botMessage}>
                    {isLast && loading ? "응답을 기다리는 중..." : chat.answer}
                  </div>
                </div>
              )}

              {/* 적용/복사 박스 */}
              {chat.apply_title && (
                <div className={styles.applyBox}>
                  <div className={styles.applyTypeLabel}>[제목 수정]</div>
                  <div className={styles.applyValueText}>{chat.apply_title}</div>
                  <div className={styles.applyBtnRow}>
                    <button
                      className={styles.applyBtn}
                      onClick={() =>
                        handleApply(
                          chat.apply_title as string,
                          "title",
                          typeof chat.question !== "string"
                            ? chat.question.start_index
                            : undefined,
                          typeof chat.question !== "string"
                            ? chat.question.end_index
                            : undefined
                        )
                      }
                    >
                      적용
                    </button>
                    <button
                      className={styles.copyBtn}
                      onClick={() => handleCopy(chat.apply_title as string)}
                    >
                      복사
                    </button>
                  </div>
                </div>
              )}
              {chat.apply_body && (
                <div className={styles.applyBox}>
                  <div className={styles.applyTypeLabel}>[내용 수정]</div>
                  <div className={styles.applyValueText}>{chat.apply_body}</div>
                  <div className={styles.applyBtnRow}>
                    <button
                      className={styles.applyBtn}
                      onClick={() =>
                        handleApply(
                          chat.apply_body as string,
                          "body",
                          typeof chat.question !== "string"
                            ? chat.question.start_index
                            : undefined,
                          typeof chat.question !== "string"
                            ? chat.question.end_index
                            : undefined
                        )
                      }
                    >
                      적용
                    </button>
                    <button
                      className={styles.copyBtn}
                      onClick={() => handleCopy(chat.apply_body as string)}
                    >
                      복사
                    </button>
                  </div>
                </div>
              )}

              {/* suggestion 있을 때만 */}
              {chat.suggestion && (
                <div className={styles.suggestion}>💡 {chat.suggestion}</div>
              )}
            </div>
          );
        })}

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
      {/* 선택된 텍스트 노출 */}
      {selectedTextData?.selectedText && (
        <div className={styles.selectedTextBoxWrapper}>
          <button
            className={styles.closeSelectedBtn}
            onClick={onClearSelectedText}
            aria-label="선택 영역 지우기"
            type="button"
          >
            ×
          </button>
          <div className={styles.selectedTextBox}>
            <span>↳</span>
            <span className={styles.selectedText}>
              {selectedTextData.selectedText}
            </span>
          </div>
        </div>
      )}
      {/* 입력창 */}
      <div className={styles.inputArea}>
        <textarea
          ref={inputRef as any}
          className={styles.chatInput}
          placeholder="메시지를 입력하세요..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
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
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
