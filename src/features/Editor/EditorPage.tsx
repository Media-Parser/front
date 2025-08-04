// src/features/Editor/EditorPage.tsx
import { useRef, useState, useCallback, useEffect } from "react";
import EditDoc from "./EditDoc/EditDoc";
import Chatbot from "../Chatbot/Chatbot";
import type { EditorLayoutHandle } from "./EditorLayout/EditorLayout";
import EditorLayout from "./EditorLayout/EditorLayout";
import EditorSidebar from "./EditorSidebar/EditorSidebar";
import styles from "./Editor.module.css";
import { useParams } from "react-router-dom";
import Suggestion from "../Suggestion/Suggestion";
import Layout from "../../components/Layout/Layout";
import type { SentenceAnalysis } from "../../types/analyzeType";

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
  const [isRightOpen, setIsRightOpen] = useState(true);
  const editorLayoutRef = useRef<EditorLayoutHandle>(null);
  const [shouldAnalyze, setShouldAnalyze] = useState<number>(0);
  const autosaveRef = useRef<((data: { title: string; contents: string }) => Promise<void>) | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<SentenceAnalysis[]>([]);

  const handleAutosave = useCallback(
    async (data: { title: string; contents: string }) => {
      if (autosaveRef.current) {
        await autosaveRef.current(data);
        console.log("[EditorPage] 임시저장 완료 후 분석 트리거!", data);
        setShouldAnalyze(prev => {
            // ✅ EditorPage: handleAutosave 내 shouldAnalyze 업데이트 전 로그
            console.log(`[EditorPage] handleAutosave: prevShouldAnalyze=${prev}, rightTab=${rightTab}`);
            const newAnalyzeValue = Date.now();
            // ✅ EditorPage: handleAutosave 내 shouldAnalyze 업데이트 값 로그
            console.log(`[EditorPage] handleAutosave: 새로운 shouldAnalyze 값=${newAnalyzeValue}`);
            return newAnalyzeValue; // rightTab 조건 없이 무조건 업데이트
          });
      }
    },
    [setShouldAnalyze] // rightTab 의존성 제거, setShouldAnalyze만 남김
  );

  useEffect(() => {
    if (rightTab === "suggestion") {
      setShouldAnalyze(Date.now());
    } else if (rightTab === "chatbot") {
      setAnalyzeResult([]);
    }
  }, [rightTab]);

  const handleSaveReady = useCallback((saveFn: () => Promise<void>) => {
    setSaveFunction(() => saveFn);
  }, []);

  const handleSave = useCallback(async () => {
    if (saveFunction) {
      await saveFunction();
    }
  }, [saveFunction]);

  return (
    <Layout
      showHeader={false}
      showSidebar={true}
      sidebar={
        <EditorSidebar
          onSave={handleSave}
          isRightOpen={isRightOpen}
          setIsRightOpen={setIsRightOpen}
          onOpenRightPanel={() => editorLayoutRef.current?.openRightPanel()}
        />
      }
    >
      <div className={styles.editorContentWrapper}>
        <EditorLayout
          ref={editorLayoutRef}
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
              rightTab={rightTab}
              onAutosave={handleAutosave}
              analyzeResult={analyzeResult}
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
              <Suggestion
                key={shouldAnalyze} 
                docId={docId ?? ""}
                contents={contents}
                shouldAnalyze={shouldAnalyze}
                onAnalyzed={() => {}}
                onAnalyzedResult={setAnalyzeResult}
              />
            )
          }
          isRightOpen={isRightOpen}
          setIsRightOpen={setIsRightOpen}
        />
      </div>
    </Layout>
  );
};

export default EditorPage;