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

// 부모에게 저장 함수 넘길 수 있게 하는 prop
interface EditDocProps {
  onSaveReady?: (saveFunction: () => Promise<void>) => void;
}

const EditDoc = ({ onSaveReady }: EditDocProps) => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div className={styles.message}>문서 ID가 없습니다.</div>;

  // 커스텀 훅으로 문서 상태 및 로직 관리
  const {
    document,
    loading,
    error,
    fetchDocument,
    autosave,
    finalizeDocument,
    setDocument,
    isSaving,
  } = useEditDocument(id);

  // id 변경될 때마다 문서 새로 fetch
  useEffect(() => {
    if (!id) return;
    fetchDocument();
  }, [id, fetchDocument]);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showAutosaveToast, setShowAutosaveToast] = useState(false);

  // 진입시 temp_docs 존재여부 체크 (이 코드는 동일)
  useEffect(() => {
    let isMounted = true;
    setReady(false); // UI 렌더링 잠깐 멈춤

    (async () => {
      try {
        const { exists } = await checkTempDocExists(id); // 임시저장 존재 여부 확인
        if (exists) {
          if (isMounted) setShowRestoreModal(true); // 있으면 복원 모달 띄우기
        } else {
          const doc = await getDocApi(id); // 없으면 원본 문서 불러오기
          if (isMounted) setDocument(doc);
        }
      } catch (e) {
        if (isMounted) setDocument(null); // 에러 시 문서 없다고 처리
      } finally {
        if (isMounted) setReady(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id, setDocument]);

  // ----------- 복원/취소 선택 시 로직 --------------
  const handleRestore = async () => {
    const doc = await getTempDocApi(id); // 임시문서 불러오기
    setDocument(doc);
    setShowRestoreModal(false);
    setReady(true);
  };

  const handleCancel = async () => {
    const doc = await getDocApi(id); // 원본문서 불러오기
    setDocument(doc);
    setShowRestoreModal(false);
    setReady(true);
  };

  // 문서 내용 반영
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setContents(document.contents || "");
    }
  }, [document]);

  // ⭐ [변경1] debounce only! 입력시마다 insert가 아님
  const debouncedAutoSave = useRef(
    debounce(async (data: Partial<Document>) => {
      await autosave({ title: data.title, contents: data.contents });
      setShowAutosaveToast(true);
      setTimeout(() => setShowAutosaveToast(false), 800); // 0.8초 노출
    }, 3000)
  ).current;

  // 문서 내용 반영
  useEffect(() => {
    if (document) {
      setIsProgrammaticUpdate(true);
      setTitle(document.title || "");
      setContents(document.contents || "");
      setTimeout(() => setIsProgrammaticUpdate(false), 0);
    }
  }, [document]);

  // 입력 핸들러
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isProgrammaticUpdate && !isFinalizing) {
      // ⭐ 최종 저장 중이 아닐 때만
      debouncedAutoSave({ title: newTitle, contents });
    }
  };
  const handleContentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContents = e.target.value;
    setContents(newContents);
    if (!isProgrammaticUpdate && !isFinalizing) {
      debouncedAutoSave({ title, contents: newContents });
    }
  };

  // ----------- 부모에게 저장 함수 전달 ------------
  // EditDoc.tsx
  useEffect(() => {
    if (onSaveReady) {
      onSaveReady(async () => {
        setIsFinalizing(true);

        // (1) 임시저장 취소 및 입력 중 debounce 즉시 반영
        debouncedAutoSave.cancel();

        // (2) 반드시 최신 title/contents를 temp에 patch(임시저장) → 이후 finalize
        await autosave({ title, contents });

        // (3) finalize API 호출(임시->docs 이동 및 임시 삭제)
        await finalizeDocument();

        setShowRestoreModal(false);
        await fetchDocument();
        setTimeout(() => {
          setIsFinalizing(false);
        }, 500); // 0.5초
      });
    }
  }, [
    finalizeDocument,
    onSaveReady,
    fetchDocument,
    debouncedAutoSave,
    title,
    contents,
    autosave, // <== 이거 꼭 넣기
  ]);

  // 컴포넌트 사라질 때 디바운스된 작업 취소
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

  // ------------------ UI 렌더링 ------------------
  return (
    <div className={styles.container}>
      {/* {isSaving && !isFinalizing && (
        <div className={styles.toast}>
          <FaSpinner className={styles.spinner} /> 임시 저장 중...
        </div>
      )} */}
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
            <button onClick={handleRestore}>복원</button>
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

      {/* 본문 입력 */}
      <textarea
        className={styles.contentsInput}
        value={contents}
        onChange={handleContentsChange}
        placeholder="내용을 입력하세요"
        disabled={!ready}
      />
    </div>
  );
};

export default EditDoc;
