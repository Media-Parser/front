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
  title: string;
  setTitle: (t: string) => void;
  contents: string;
  setContents: (c: string) => void;
  autosaveRef?: React.MutableRefObject<
    ((data: { title: string; contents: string }) => Promise<void>) | null
  >;
  rightTab: "chatbot" | "suggestion";
  onAutosave?: (data: { title: string; contents: string }) => void;
}

const EditDoc = ({
  onSaveReady,
  onSelectText,
  title,
  setTitle,
  contents,
  setContents,
  autosaveRef,
  // rightTab,
  onAutosave,
}: EditDocProps) => {
  const [isReady, setIsReady] = useState(false);

  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div className={styles.message}>문서 ID가 없습니다.</div>; // Hook 호출 이후이므로 안전
  }

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
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isSavingFinal, setIsSavingFinal] = useState(false); // Renamed from isFinalizing for clarity
  const [showAutosaveToast, setShowAutosaveToast] = useState(false);
  // const [analysis, setAnalysis] = useState<SentenceAnalysis[]>([] as SentenceAnalysis[]); 

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
  const [topicId, setTopicId] = useState<number | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);

  //  Initial document fetch on ID change
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
  // const analyzeDocument = useCallback(
  //   async (docId: string, contents: string) => {
  //     try {
  //       const results = await analyzeDocumentApi(docId, contents);
  //       setAnalysis(results);
  //     } catch {
  //       setAnalysis([]);
  //     }
  //   },
  //   []
  // );

  const ensureTrailingBreak = () => {
    const el = editableRef.current;
    if (!el) return;

    const lastNode = el.lastChild;

    // 마지막이 텍스트가 아닌 블록(div 등)일 경우 뒤에 <br> 삽입
    if (!lastNode || lastNode.nodeType !== Node.TEXT_NODE) {
      const br = window.document.createElement("br");
      el.appendChild(br);
    }
  };

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
      // setTopicId(document.topic_id ?? null);
      // setHashtags(document.hashtag ?? []);

      if (editableRef.current) {
        editableRef.current.innerText = document.contents || "";
        if (!document.contents) {
          editableRef.current.innerHTML = "<br />";
        }
      }
    }
  }, [document]);

  useEffect(() => {
    if (editableRef.current && editableRef.current.innerText !== contents) {
      editableRef.current.innerText = contents || "";

      // ✅ 커서 생성을 위해 <br> 삽입
      const el = editableRef.current;
      const lines = contents.split(/\r?\n/);

      // 기존 내용 제거
      el.innerHTML = "";

      for (let i = 0; i < lines.length; i++) {
        const textNode = window.document.createTextNode(lines[i]);
        el.appendChild(textNode);
        el.appendChild(window.document.createElement("br")); // 항상 줄 끝에 br 삽입
      }

      ensureTrailingBreak();
    }
  }, [contents]);

  // ---
  // Autosave Logic
  // ---

  // Debounced autosave function
  const debouncedAutoSave = useRef(
    debounce(async (data: Partial<Document>) => {
      await autosave({
        title: data.title ?? "",
        contents: data.contents ?? "",
      });
      console.log("💾 [EditDoc] 임시저장 완료!", { title: data.title ?? "", contentsLen: (data.contents ?? "").length });
      setShowAutosaveToast(true);
      setTimeout(() => setShowAutosaveToast(false), 1000);
  
      // 자동저장이 실제로 끝난 다음에만 콜백!
      if (onAutosave) {
        onAutosave({
          title: data.title ?? "",
          contents: data.contents ?? "",
        });
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

  useEffect(() => {
    if (document) {
      // console.log("document 전체:", document);
      setTitle(document.title || "");
      setContents(document.contents || "");
      setTopicId(document.topic_id ?? null);
      setHashtags(document.hashtag ?? []);
    }
  }, [document]);

  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

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

    sel.deleteFromDocument();

    const range = sel.getRangeAt(0);
    const lines = text.split(/\r?\n/);

    const fragment = window.document.createDocumentFragment();
    for (let i = 0; i < lines.length; i++) {
      fragment.appendChild(window.document.createTextNode(lines[i]));
      if (i < lines.length - 1) {
        fragment.appendChild(window.document.createElement("br"));
      }
    }

    range.insertNode(fragment);
    sel.collapseToEnd();

    ensureTrailingBreak();

    // ⛔️ 여기서 바로 contents 값 읽는 것은 stale할 수 있음
    // ✅ 아래처럼 next tick에서 읽어야 정확함
    setTimeout(() => {
      const currentText = editableRef.current?.innerText || "";
      setContents(currentText);

      if (!isSavingFinal) {
        debouncedAutoSave({ title, contents: currentText });
      }
    }, 0);
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

      {/* Topic ID & Hashtags */}
      {(topicId !== null || hashtags.length > 0) && (
        <div className={styles.metaInfo}>
          {topicId !== null && topicId !== -1 && (
            <div className={styles.topicId}>토픽 ID: {topicId}</div>
          )}
          {hashtags.length > 0 && (
            <div className={styles.hashtags}>
              {hashtags.map((tag) => (
                <span key={tag} className={styles.hashtag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

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
    </div>
  );
};

export default EditDoc;