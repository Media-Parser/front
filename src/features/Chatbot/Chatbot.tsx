import { useEffect, useState } from "react";
import styles from "./Chatbot.module.css";
import { Send } from "lucide-react";

const Chatbot = () => {
  const fullMessage = "안녕하세요! 무엇을 도와드릴까요?";
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);

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

  const handleOptionClick = (option: string) => {
    alert(`선택한 옵션: ${option}`);
    // 나중에 이 부분에 해당 기능 연결하면 됨
  };

  return (
    <div className={styles.Wrapper}>
      <div className={styles.chatMessages}>
        <h3 className={styles.defaultMessage}>
          <span className={styles.highlight}>기잣말싸미</span>에게 질문하세요.
        </h3>
        <div className={styles.botMessage}>{displayedMessage}</div>

        {showOptions && (
          <div className={styles.options}>
            {[
              "기사 제목 추천 받기",
              "기사 톤 다듬기",
              "유사 기사 추천",
              "다른 의견 듣기",
            ].map((option, idx) => (
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

        <div className={styles.userMessage}>날씨 알려줘!</div>
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="메시지를 입력하세요..."
        />
        <button className={styles.sendButton}>
          <Send />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
