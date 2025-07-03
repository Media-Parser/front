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
} from "../../../lib/api/documentsApi";
import type { Document } from "../../../types/documentType";
import styles from "./EditDoc.module.css";

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
}

const EditDoc = ({ onSaveReady, onSelectText }: EditDocProps) => {
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
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isSavingFinal, setIsSavingFinal] = useState(false); // Renamed from isFinalizing for clarity
  const [showAutosaveToast, setShowAutosaveToast] = useState(false);

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

  // Update local state when document from hook changes
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setContents(document.contents || "");
      if (editableRef.current) {
        editableRef.current.innerText = document.contents || "";
        // If content is empty, ensure a <br> for proper cursor display in contenteditable
        if (!document.contents) {
          editableRef.current.innerHTML = "<br />";
        }
      }
    }
  }, [document]);

  // ---
  // Autosave Logic
  // ---

  // Debounced autosave function
  const debouncedAutoSave = useRef(
    debounce(async (data: Partial<Document>) => {
      await autosave({ title: data.title, contents: data.contents });
      setShowAutosaveToast(true);
      setTimeout(() => setShowAutosaveToast(false), 1000);
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSavingFinal) {
      debouncedAutoSave({ title: newTitle, contents });
    }
  };

  const handleContentsInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContents = e.currentTarget.innerText;
    setContents(newContents);
    if (!isSavingFinal) {
      debouncedAutoSave({ title, contents: newContents });
    }
  };

  const handleRestore = useCallback(async () => {
    try {
      const doc = await getTempDocApi(id);
      setDocument(doc);
      setShowRestoreModal(false);
    } catch (e) {
      console.error("Failed to restore temp document:", e);
      // Optionally show an error message to the user
    } finally {
      setIsReady(true); // Ensure ready state is set
    }
  }, [id, setDocument]);

  const handleCancelRestore = useCallback(async () => {
    try {
      const doc = await getDocApi(id);
      setDocument(doc);
      setShowRestoreModal(false);
    } catch (e) {
      console.error("Failed to fetch original document:", e);
      // Optionally show an error message to the user
    } finally {
      setIsReady(true); // Ensure ready state is set
    }
  }, [id, setDocument]);

  // Logic for handling text selection and showing the AI button
  const handleTextSelection = useCallback(() => {
    const sel = window.getSelection();
    // Check if there's a selection, it's not collapsed (empty), and it's within our editable area
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

    // If no client rects or dimensions are zero, hide the button
    if (rects.length === 0 || (rects[0].width === 0 && rects[0].height === 0)) {
      setShowAskAIButton(false);
      setSelectionButtonPosition(null);
      return;
    }

    // Use the first client rect for positioning
    const rect = rects[0];
    setShowAskAIButton(true);
    setSelectionButtonPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });

    const text = sel.toString();
    setSelectedText(text);

    // Calculate start and end indices of the selected text within the full content
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
      // Clear selection and hide button after action
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
      if (
        editableRef.current &&
        !editableRef.current.contains(event.target as Node) &&
        !event.target.closest(`.${styles.replyQuoteBtn}`) // Allow clicks on the button itself
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
        // After final save, refetch document to get the latest state
        await fetchDocument();
        // Reset state
        setShowRestoreModal(false); // In case it was showing
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
      <input
        type="text"
        className={styles.titleInput}
        value={title}
        onChange={handleTitleChange}
        placeholder="제목을 입력하세요"
        disabled={!isReady}
        aria-label="문서 제목"
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
          onKeyUp={handleTextSelection} // Also trigger on key up for keyboard selections
          suppressContentEditableWarning
          spellCheck={false}
          onInput={handleContentsInput}
          tabIndex={0}
          aria-label="문서 편집기"
        />
      </div>

      {/* AI Ask Button */}
      {showAskAIButton && selectionButtonPosition && (
        <span
          className={styles.replyQuoteBtn}
          style={{
            top: selectionButtonPosition.top - 38, // Adjust for button height
            left: selectionButtonPosition.left,
            position: "fixed", // Keep fixed for dynamic positioning
            zIndex: 120,
          }}
          onClick={handleAskAI}
          // Prevent hiding the button immediately when clicked
          onMouseDown={(e) => e.stopPropagation()}
          tabIndex={0}
          aria-label="AI에게 물어보기"
        >
          <span className={styles.gptQuoteIcon}>
            <BiSolidQuoteAltRight />
          </span>
          <span className={styles.gptTooltip}>AI에게 물어보기</span>
        </span>
      )}
    </div>
  );
};

export default EditDoc;
