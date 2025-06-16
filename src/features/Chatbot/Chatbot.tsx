import styles from "./Chatbot.module.css";
import { Send } from "lucide-react";

const Chatbot = () => {
  return (
    <div className={styles.Wrapper}>
      {/* 챗봇 대화 메시지 출력화면 */}
      <div className={styles.chatMessages}>
        <h3 className={styles.defaultMessage}>기잣말싸미에게 질문하세요.</h3>
        <div className={styles.botMessage}>
          안녕하세요! 무엇을 도와드릴까요?
        </div>
        <div className={styles.userMessage}>날씨 알려줘!</div>
      </div>
      {/* 메시지 입력 프롬프트 */}
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
