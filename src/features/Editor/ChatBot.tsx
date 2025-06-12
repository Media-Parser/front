// 📁 src/features/Editor/ChatBot.tsx
import styles from "./ChatBot.module.css";

const ChatBot = () => {
  return (
    <div className={styles.chatContainer}>
      <h2>도움이 필요하신가요?</h2>
      <div className={styles.chatBox}>
        <p>챗봇 기능은 여기에 구현됩니다 🧠</p>
        {/* 메시지 입력창, 답변 출력 등 구현 가능 */}
      </div>
    </div>
  );
};

export default ChatBot;
