// 📁 src/features/Editor/EditorPage.tsx
import { useRef, useState, useCallback } from "react";
import EditDoc from "./EditDoc/EditDoc";
import Chatbot from "../Chatbot/Chatbot";
import EditorLayout from "./EditorLayout/EditorLayout";
import EditorSidebar from "./EditorSidebar/EditorSidebar";
import styles from "./Editor.module.css";
import { useParams } from "react-router-dom";
import Suggestion from "../Suggestion/Suggestion";

const EditorPage = () => {
  const { id: docId } = useParams<{ id: string }>();
  const [saveFunction, setSaveFunction] = useState<(() => Promise<void>) | null>(null);
  const [rightTab, setRightTab] = useState<"chatbot" | "suggestion">("chatbot");
  const [selectedTextData, setSelectedTextData] = useState<{
    selectedText: string | null;
    startIndex: number;
    endIndex: number;
  } | null>(null);

  const [title, setTitle] = useState<string>("");
  const [contents, setContents] = useState<string>("");

  const autosaveRef = useRef<((data: { title: string; contents: string }) => Promise<void>) | null>(null);

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
              title={title}
              setTitle={setTitle}
              contents={contents}
              setContents={setContents}
              autosaveRef={autosaveRef}
            />
          }
          rightTab={rightTab}
          setRightTab={setRightTab}
          rightContent={
            rightTab === "chatbot" ? (
              <Chatbot
                docId={docId ?? ""}
                selectedTextData={selectedTextData}
                onMessageSent={() => setSelectedTextData(null)}
                onClearSelectedText={() => setSelectedTextData(null)}
                setEditorTitle={setTitle}
                setEditorBody={setContents}
                title={title}
                contents={contents}
                autosave={async (data) => {
                  if (autosaveRef.current) {
                    await autosaveRef.current(data);
                  }
                }}
              />
            ) : (
              <Suggestion docId={docId ?? ""} />
            )
          }
        />
      </div>
    </div>
  );
};

export default EditorPage;
