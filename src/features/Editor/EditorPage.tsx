// 📁 src/features/Editor/EditorPage.tsx
import EditorLayout from "./EditorLayout/EditorLayout";
import EditorSidebar from "./EditorSidebar/EditorSidebar";
import styles from "./Editor.module.css";
import Chatbot from "../Chatbot/Chatbot";
import EditDoc from "./EditDoc/EditDoc";
import { useState, useCallback } from "react";

const EditorPage = () => {
  const [saveFunction, setSaveFunction] = useState<
    (() => Promise<void>) | null
  >(null);

  const handleSaveReady = useCallback((saveFn: () => Promise<void>) => {
    setSaveFunction(() => saveFn);
  }, []);

  const handleSave = useCallback(async () => {
    if (saveFunction) {
      await saveFunction();
    }
  }, [saveFunction]);

  return (
    <div>
      <EditorSidebar onSave={handleSave} />
      <div className={styles.pageWrapper}>
        <EditorLayout
          left={<EditDoc onSaveReady={handleSaveReady} />}
          right={<Chatbot />}
          showHeader={true}
        />
      </div>
    </div>
  );
};

export default EditorPage;
