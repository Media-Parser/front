// 📁 src/features/Editor/EditorPage.tsx
import EditorLayout from "./EditorLayout/EditorLayout";
import EditorSidebar from "./EditorSidebar/EditorSidebar";
import styles from "./Editor.module.css";
import Chatbot from "../Chatbot/Chatbot";
import EditDoc from "./EditDoc/EditDoc";
import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";

const EditorPage = () => {
  const { id: docId } = useParams<{ id: string }>();
  const [saveFunction, setSaveFunction] = useState<
    (() => Promise<void>) | null
  >(null);

  const [selectedTextData, setSelectedTextData] = useState<{
    selectedText: string | null;
    startIndex: number;
    endIndex: number;
  } | null>(null);

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
          left={
            <EditDoc
              onSaveReady={handleSaveReady}
              onSelectText={(txt, start, end) => {
                setSelectedTextData({
                  selectedText: txt,
                  startIndex: start,
                  endIndex: end,
                });
              }}
            />
          }
          right={
            <Chatbot
              docId={docId ?? ""}
              selectedTextData={selectedTextData}
              onMessageSent={() => setSelectedTextData(null)}
              onClearSelectedText={() => setSelectedTextData(null)}
            />
          }
          showHeader={true}
        />
      </div>
    </div>
  );
};

export default EditorPage;
