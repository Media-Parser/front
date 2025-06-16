// 📁 src/features/Editor/Editor/EditorPage.tsx
import EditorLayout from "./EditorLayout/EditorLayout";
import EditorSidebar from "./EditorSidebar/EditorSidebar";
import styles from "./Editor.module.css";
import Chatbot from "../Chatbot/Chatbot";
import EditDoc from "./EditDoc/EditDoc";

const EditorPage = () => {
  return (
    <div>
      <EditorSidebar />
      <div className={styles.pageWrapper}>
        <EditorLayout
          left={<EditDoc />}
          right={<Chatbot />}
          showHeader={true}
        />
      </div>
    </div>
  );
};

export default EditorPage;
