// 📁 src/features/Editor/EditorPage.tsx
import EditorLayout from "./EditorLayout/EditorLayout";
import EditorSidebar from "./EditorSidebar/EditorSidebar";
import styles from "./Editor.module.css";
import Chatbot from "../Chatbot/Chatbot";
import EditDoc from "./EditDoc/EditDoc";
import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import Suggestion from "../Suggestion/Suggestion";

const EditorPage = () => {
  const { id: docId } = useParams<{ id: string }>();
  const [saveFunction, setSaveFunction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [rightTab, setRightTab] = useState<"chatbot" | "suggestion">("chatbot");

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

  console.log("🔥 여기가 진짜 실행됨!");

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");

  useEffect(() => {
    console.log("[EditorPage] title:", title);
  }, [title]);
  useEffect(() => {
    console.log("[EditorPage] contents:", contents);
  }, [contents]);

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
