  // src/features/Editor/EditDoc/EditDoc.tsx
  import { useState, useEffect, useRef, useCallback } from "react";
  import debounce from "lodash.debounce";
  import { useParams } from "react-router-dom";
  import { FaSpinner, FaCheck } from "react-icons/fa";
  import { BiSolidQuoteAltRight } from "react-icons/bi";
  import { useEditDocument } from "../../../hooks/useEditDocument";
  import {
    checkTempDocExists,
    getTempDocApi,
    getDocApi,
    deleteTempDocApi,
  } from "../../../lib/api/documentsApi";
  import type { Document } from "../../../types/documentType";
  import styles from "./EditDoc.module.css";
  import { analyzeDocumentApi } from "../../../lib/api/aiApi";
  import type { SentenceAnalysis } from "../../../types/analyzeType";

  // ---
  // Components
  // ---

  interface RestoreModalProps {
    onRestore: () => void;
    onCancel: () => void;
  }

  const RestoreModal = ({ onRestore, onCancel }: RestoreModalProps) => (
    <div className={styles.restoreModal}>
      <div className={styles.modalContent}>
        <p>
          이전에 임시저장된 편집본이 있습니다.
          <br />
          복원하시겠습니까?
        </p>
        <button onClick={onRestore}>확인</button>
        <button onClick={onCancel}>취소</button>
      </div>
    </div>
  );

  // ---
  // Main Component
  // ---

  interface EditDocProps {
    onSaveReady?: (saveFunction: () => Promise<void>) => void;
    onSelectText?: (txt: string, start: number, end: number) => void;
    title: string; // ★ 추가
    setTitle: (t: string) => void; // ★ 추가
    contents: string; // ★ 추가
    setContents: (c: string) => void; // ★ 추가
    autosaveRef?: React.MutableRefObject<
      ((data: { title: string; contents: string }) => Promise<void>) | null
    >;
    rightTab: "chatbot" | "suggestion";
  }

  const EditDoc = ({
    onSaveReady,
    onSelectText,
    title,
    setTitle,
    contents,
    setContents,
    autosaveRef,
    rightTab,
  }: EditDocProps) => {
    const { id } = useParams<{ id: string }>();
    if (!id) return <div className={styles.message}>문서 ID가 없습니다.</div>;

    const {
      document,
      loading,
      error,
      fetchDocument,
      autosave,
      finalizeDocument,
      setDocument,
    } = useEditDocument(id);

    // Component State
    const [isReady, setIsReady] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [isSavingFinal, setIsSavingFinal] = useState(false); // Renamed from isFinalizing for clarity
    const [showAutosaveToast, setShowAutosaveToast] = useState(false);
    const [analysis, setAnalysis] = useState<SentenceAnalysis[]>([]);

    // contenteditable related state and refs
    const editableRef = useRef<HTMLDivElement>(null);
    const [showAskAIButton, setShowAskAIButton] = useState(false);
    const [selectionButtonPosition, setSelectionButtonPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const [selectedText, setSelectedText] = useState<string>("");
    const [selectionRange, setSelectionRange] = useState<{
      start: number;
      end: number;
    } | null>(null);

    // ---
    // Data Fetching & Initialization Effects
    // ---

    // Initial document fetch on ID change
    useEffect(() => {
      if (id) {
        fetchDocument();
      }
    }, [id, fetchDocument]);

    useEffect(() => {
      if (autosaveRef) {
        autosaveRef.current = autosave;
      }
    }, [autosave, autosaveRef]);

    // Handle temporary document check and restoration modal
    useEffect(() => {
      let isMounted = true;
      setIsReady(false); // Set to false while checking temp doc

      const checkAndSetDocument = async () => {
        try {
          const { exists } = await checkTempDocExists(id);
          if (isMounted) {
            if (exists) {
              setShowRestoreModal(true);
            } else {
              const doc = await getDocApi(id);
              setDocument(doc);
            }
          }
        } catch (e) {
          if (isMounted) {
            console.error("Failed to check or fetch document:", e);
            setDocument(null);
          }
        } finally {
          if (isMounted) {
            setIsReady(true);
          }
        }
      };

      checkAndSetDocument();

      return () => {
        isMounted = false;
      };
    }, [id, setDocument]);

    // 분석 요청 함수
    const analyzeDocument = useCallback(
      async (docId: string, contents: string) => {
        try {
          const results = await analyzeDocumentApi(docId, contents);
          setAnalysis(results);
        } catch {
          setAnalysis([]);
        }
      },
      []
    );

    // 복원: 임시 문서 불러오기
    const handleRestore = useCallback(async () => {
      try {
        const doc = await getTempDocApi(id);
        setDocument(doc);
        setShowRestoreModal(false);
      } catch (e) {
        console.error("Failed to restore temp document:", e);
      } finally {
        setIsReady(true);
      }
    }, [id, setDocument]);

    // 취소: 임시문서 삭제 & 원본 불러오기
    const handleCancelRestore = useCallback(async () => {
      try {
        await deleteTempDocApi(id);
        const doc = await getDocApi(id);
        setDocument(doc);
        setShowRestoreModal(false);
      } catch (e) {
        alert("임시저장 삭제 실패");
        console.error("Failed to fetch original document:", e);
      } finally {
        setIsReady(true);
      }
    }, [id, setDocument]);

    useEffect(() => {
      if (document) {
        setTitle(document.title || "");
        setContents(document.contents || "");
        if (editableRef.current) {
          editableRef.current.innerText = document.contents || "";
          if (!document.contents) {
            editableRef.current.innerHTML = "<br />";
          }
        }
      }
    }, [document]);

    useEffect(() => {
      // contents state가 변경될 때마다 DOM 반영
      if (editableRef.current && editableRef.current.innerText !== contents) {
        editableRef.current.innerText = contents || "";
        if (!contents) {
          editableRef.current.innerHTML = "<br />";
        }
      }
    }, [contents]);

    // ---
    // Autosave Logic
    // ---

    // Debounced autosave function
    const debouncedAutoSave = useRef(
      debounce(async (data: Partial<Document>) => {
        await autosave({ title: data.title, contents: data.contents });
        setShowAutosaveToast(true);
        setTimeout(() => setShowAutosaveToast(false), 1000);
    
        // suggestion 탭일 때만 분석
        if (rightTab === "suggestion" && id && data.contents) {
          analyzeDocument(id, data.contents);
        }
      }, 3000)
    ).current;

    // Clean up debounced autosave on component unmount
    useEffect(() => {
      return () => {
        debouncedAutoSave.cancel();
      };
    }, [debouncedAutoSave]);

    // ---
    // Event Handlers
    // ---

    // const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const newTitle = e.target.value;
    //   setTitle(newTitle);
    //   if (!isSavingFinal) {
    //     debouncedAutoSave({ title: newTitle, contents });
    //   }
    // };

    // const handleContentsInput = (e: React.FormEvent<HTMLDivElement>) => {
    //   const newContents = e.currentTarget.innerText;
    //   setContents(newContents);
    //   if (!isSavingFinal) {
    //     debouncedAutoSave({ title, contents: newContents });
    //   }
    // };

    // Logic for handling text selection and showing the AI button
    const handleTextSelection = useCallback(() => {
      const sel = window.getSelection();
      if (
        !sel ||
        sel.rangeCount === 0 ||
        sel.isCollapsed ||
        !editableRef.current?.contains(sel.anchorNode)
      ) {
        setShowAskAIButton(false);
        setSelectionButtonPosition(null);
        setSelectionRange(null);
        setSelectedText("");
        return;
      }

      const range = sel.getRangeAt(0);
      const rects = range.getClientRects();

      if (rects.length === 0 || (rects[0].width === 0 && rects[0].height === 0)) {
        setShowAskAIButton(false);
        setSelectionButtonPosition(null);
        return;
      }

      const rect = rects[0];
      setShowAskAIButton(true);
      setSelectionButtonPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });

      const text = sel.toString();
      setSelectedText(text);

      const fullText = editableRef.current?.innerText || "";
      const start = fullText.indexOf(text);
      setSelectionRange(
        start !== -1 ? { start, end: start + text.length } : null
      );
    }, []);

    // Handle AI button click
    const handleAskAI = useCallback(() => {
      if (selectedText && selectionRange && onSelectText) {
        onSelectText(selectedText, selectionRange.start, selectionRange.end);
        window.getSelection()?.removeAllRanges();
        setShowAskAIButton(false);
        setSelectionButtonPosition(null);
        setSelectionRange(null);
        setSelectedText("");
      }
    }, [onSelectText, selectedText, selectionRange]);

    // Hide AI button when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // event.target이 HTMLElement 타입임을 보장
        const target = event.target as HTMLElement | null;
        if (
          editableRef.current &&
          target &&
          !editableRef.current.contains(target) &&
          !target.closest(`.${styles.replyQuoteBtn}`)
        ) {
          setShowAskAIButton(false);
          setSelectionButtonPosition(null);
          setSelectionRange(null);
          setSelectedText("");
        }
      };

      window.document.addEventListener("mousedown", handleClickOutside);
      return () =>
        window.document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ---
    // External Save Functionality
    // ---

    // Expose a save function to parent component
    useEffect(() => {
      if (onSaveReady) {
        const saveFunction = async () => {
          setIsSavingFinal(true);
          debouncedAutoSave.cancel(); // Cancel any pending autosaves
          await autosave({ title, contents }); // Ensure latest changes are saved
          await finalizeDocument(); // Finalize the document
          await fetchDocument();
          setShowRestoreModal(false);
          setTimeout(() => setIsSavingFinal(false), 500);
        };
        onSaveReady(saveFunction);
      }
    }, [
      onSaveReady,
      finalizeDocument,
      fetchDocument,
      debouncedAutoSave,
      title,
      contents,
      autosave,
    ]);

    // ---
    // UI Rendering
    // ---

    if (error) return <div className={styles.message}>에러: {error}</div>;
    if (loading || !isReady) {
      return <div className={styles.message}>로딩 중...</div>;
    }
    if (!document) {
      return <div className={styles.message}>문서가 존재하지 않습니다.</div>;
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      insertTextAtCursor(text);
    };

    function insertTextAtCursor(text: string) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      sel.deleteFromDocument(); // 선택 영역 삭제
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        sel.getRangeAt(0).insertNode(window.document.createTextNode(lines[i]));
        if (i !== lines.length - 1) {
          sel.getRangeAt(0).insertNode(window.document.createElement("br"));
        }
        // 커서 이동
        sel.collapseToEnd();
      }
    }

    return (
      <div className={styles.container}>
        {/* Autosave Toast */}
        {showAutosaveToast && !isSavingFinal && (
          <div className={styles.autosaveToast}>
            <span className={styles.autosaveIcon}>
              <FaCheck />
            </span>
            자동 임시저장
          </div>
        )}

        {/* Final Saving Toast */}
        {isSavingFinal && (
          <div className={styles.toast}>
            <FaSpinner className={styles.spinner} /> 저장 중입니다...
          </div>
        )}

        {/* Restore Modal */}
        {showRestoreModal && (
          <RestoreModal
            onRestore={handleRestore}
            onCancel={handleCancelRestore}
          />
        )}

        {/* Title Input */}
        <textarea
          className={styles.titleInput}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!isSavingFinal) {
              debouncedAutoSave({ title: e.target.value, contents });
            }
          }}
          placeholder="제목을 입력하세요"
          disabled={!isReady}
          aria-label="문서 제목"
          rows={1} // 기본 행 높이
          style={{ resize: "none", height: "auto", overflow: "hidden" }} // (옵션) 수동 높이조절 비활성화, 자동 늘리기
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px"; // 내용에 맞게 높이 자동 조절
            setTitle(el.value);
          }}
        />

        {/* Content Editable Area */}
        <div className={styles.contentsWrapper}>
          <div
            className={`${styles.contentsInput} ${
              contents === "" ? styles.empty : ""
            }`}
            contentEditable
            ref={editableRef}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            suppressContentEditableWarning
            spellCheck={false}
            onInput={(e) => {
              setContents(e.currentTarget.innerText);
              if (!isSavingFinal) {
                debouncedAutoSave({ title, contents: e.currentTarget.innerText });
              }
            }}
            onPaste={handlePaste}
            tabIndex={0}
            aria-label="문서 편집기"
          />
        </div>

        {/* AI Ask Button */}
        {showAskAIButton && selectionButtonPosition && (
          <span
            className={styles.replyQuoteBtn}
            style={{
              top: selectionButtonPosition.top - 38,
              left: selectionButtonPosition.left,
              position: "fixed",
              zIndex: 120,
            }}
            onClick={handleAskAI}
            onMouseDown={(e) => e.stopPropagation()}
            tabIndex={0}
            aria-label="Polexible에게 묻기"
          >
            <span className={styles.gptQuoteIcon}>
              <BiSolidQuoteAltRight />
            </span>
            <span className={styles.gptTooltip}>Polexible에게 묻기</span>
          </span>
        )}
        {/* === 분석 결과 하이라이트 === */}
        {rightTab === "suggestion" && (
        <div className={styles.analysisResult}>
          {analysis.length > 0 &&
            analysis.map((sent) => {
              // explanation이 string일 수도 있으니 항상 배열로
              const explanations = Array.isArray(sent.explanation)
              ? sent.explanation
              : typeof sent.explanation === "string" && sent.explanation.length > 0
                ? [sent.explanation]
                : [];

              return (
                <div key={sent.index} style={{ marginBottom: 8 }}>
                  <span
                    className={
                      sent.flag ? styles.analysisHighlight : styles.analysisPlain
                    }
                    title={explanations.join(" / ")}
                  >
                    {sent.text}
                  </span>
                  {sent.flag && explanations.length > 0 && (
                    <span className={styles.analysisExplanation}>
                      ⚠️ {explanations.join(" / ")}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      )}
      </div>
    );
  };

  export default EditDoc;
