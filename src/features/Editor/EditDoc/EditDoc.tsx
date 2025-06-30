import { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { useEditDocument } from "../../../hooks/useEditDocument";
import styles from "./EditDoc.module.css";
import { useParams } from "react-router-dom";
import {
  checkTempDocExists,
  getTempDocApi,
  getDocApi,
} from "../../../lib/api/documentsApi";
import type { Document } from "../../../types/documentType";
import { FaSpinner, FaCheck } from "react-icons/fa";
import { BiSolidQuoteAltRight } from "react-icons/bi";

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

  useEffect(() => {
    if (!id) return;
    fetchDocument();
  }, [id, fetchDocument]);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  // const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showAutosaveToast, setShowAutosaveToast] = useState(false);
  const replyBtnRef = useRef<HTMLSpanElement>(null);

  // contenteditable 용 상태 ↓
  const editableRef = useRef<HTMLDivElement>(null);
  const [showAskBtn, setShowAskBtn] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // 임시저장 복원
  useEffect(() => {
    let isMounted = true;
    setReady(false);
    (async () => {
      try {
        const { exists } = await checkTempDocExists(id);
        if (exists) {
          if (isMounted) setShowRestoreModal(true);
        } else {
          const doc = await getDocApi(id);
          if (isMounted) setDocument(doc);
        }
      } catch (e) {
        if (isMounted) setDocument(null);
      } finally {
        if (isMounted) setReady(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id, setDocument]);

  const handleRestore = async () => {
    const doc = await getTempDocApi(id);
    setDocument(doc);
    setShowRestoreModal(false);
    setReady(true);
  };
  const handleCancel = async () => {
    const doc = await getDocApi(id);
    setDocument(doc);
    setShowRestoreModal(false);
    setReady(true);
  };

  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setContents(document.contents || "");
    }
  }, [document]);

  const debouncedAutoSave = useRef(
    debounce(async (data: Partial<Document>) => {
      await autosave({ title: data.title, contents: data.contents });
      setShowAutosaveToast(true);
      setTimeout(() => setShowAutosaveToast(false), 1000);
    }, 3000)
  ).current;

  useEffect(() => {
    if (document && editableRef.current) {
      // setIsProgrammaticUpdate(true);
      setTitle(document.title || "");
      setContents(document.contents || "");
      editableRef.current.innerText = document.contents || "";
      // setTimeout(() => setIsProgrammaticUpdate(false), 0);
    }
  }, [document]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isFinalizing) {
      debouncedAutoSave({ title: newTitle, contents });
    }
  };

  // contenteditable 입력 핸들러
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContents(e.currentTarget.innerText);
    if (!isFinalizing) {
      debouncedAutoSave({ title, contents: e.currentTarget.innerText });
    }
  };

  // 드래그/선택 감지 및 말풍선 위치 계산
  const handleSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setShowAskBtn(false);
      setSelectionRect(null);
      setSelectionRange(null);
      setSelectedText("");
      return;
    }
    const range = sel.getRangeAt(0);
    // ⭐ 첫번째 줄 첫 문자 위치를 구함
    const clientRects = range.getClientRects();
    const rect =
      clientRects.length > 0 ? clientRects[0] : range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    setShowAskBtn(true);
    setSelectionRect({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });

    const text = sel.toString();
    setSelectedText(text);

    const fullText = editableRef.current?.innerText || "";
    const start = fullText.indexOf(text);
    setSelectionRange(
      start !== -1
        ? { start, end: start + text.length }
        : { start: -1, end: -1 }
    );
  };

  // 버튼 클릭 시 상위로 텍스트/위치 전달
  const handleAskAI = () => {
    if (selectedText && selectionRange && onSelectText) {
      onSelectText(selectedText, selectionRange.start, selectionRange.end);
      setShowAskBtn(false);
      setSelectionRect(null);
      setSelectionRange(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  // 바깥 클릭시 버튼 사라지게
  useEffect(() => {
    const handleClick = () => {
      setShowAskBtn(false);
      setSelectionRect(null);
      setSelectionRange(null);
      setSelectedText("");
      // window.getSelection()?.removeAllRanges();
    };
    window.document.addEventListener("mousedown", handleClick);
    return () => window.document.removeEventListener("mousedown", handleClick);
  }, []);

  // 저장 함수 부모로 전달
  useEffect(() => {
    if (onSaveReady) {
      onSaveReady(async () => {
        setIsFinalizing(true);
        debouncedAutoSave.cancel();
        await autosave({ title, contents });
        await finalizeDocument();
        setShowRestoreModal(false);
        await fetchDocument();
        setTimeout(() => setIsFinalizing(false), 500);
      });
    }
  }, [
    finalizeDocument,
    onSaveReady,
    fetchDocument,
    debouncedAutoSave,
    title,
    contents,
    autosave,
  ]);

  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  // UI
  if (error) return <div className={styles.message}>에러: {error}</div>;
  if (loading || !ready) {
    return <div className={styles.message}>로딩 중...</div>;
  }
  if (!document) {
    return <div className={styles.message}>문서가 존재하지 않습니다.</div>;
  }

  return (
    <div className={styles.container}>
      {showAutosaveToast && !isFinalizing && (
        <div className={styles.autosaveToast}>
          <span className={styles.autosaveIcon}>
            <FaCheck />
          </span>
          자동 임시저장
        </div>
      )}
      {isFinalizing && (
        <div className={styles.toast}>
          <FaSpinner className={styles.spinner} /> 저장 중입니다...
        </div>
      )}
      {showRestoreModal && (
        <div className={styles.restoreModal}>
          <div className={styles.modalContent}>
            <p>
              이전에 임시저장된 편집본이 있습니다.
              <br />
              복원하시겠습니까?
            </p>
            <button onClick={handleRestore}>확인</button>
            <button onClick={handleCancel}>취소</button>
          </div>
        </div>
      )}

      {/* 제목 입력 */}
      <input
        type="text"
        className={styles.titleInput}
        value={title}
        onChange={handleTitleChange}
        placeholder="제목을 입력하세요"
        disabled={!ready}
      />

      {/* 본문 contenteditable (기존 textarea 스타일 유사) */}
      <div className={styles.contentsWrapper}>
        <div
          className={styles.contentsInput}
          contentEditable
          ref={editableRef}
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
          suppressContentEditableWarning
          spellCheck={false}
          onInput={handleInput}
          tabIndex={0}
          aria-label="문서 편집기"
          style={{ minHeight: "240px" }}
        />
      </div>
      {/* {contents}
      </div>  */}
      {showAskBtn && selectionRect && (
        <span
          ref={replyBtnRef}
          className={styles.replyQuoteBtn}
          style={{
            position: "fixed",
            top: selectionRect.top - 38,
            left: selectionRect.left,
            zIndex: 120,
          }}
          onClick={handleAskAI}
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
