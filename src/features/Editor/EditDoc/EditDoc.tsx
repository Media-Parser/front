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
import { FaSpinner } from "react-icons/fa";

interface EditDocProps {
  onSaveReady?: (saveFunction: () => Promise<void>) => void;
}

const EditDoc = ({ onSaveReady }: EditDocProps) => {
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
    isSaving,
  } = useEditDocument(id);

  useEffect(() => {
    if (!id) return;
    fetchDocument();
    setIsTempDocCreated(false);
  }, [id, fetchDocument]);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [ready, setReady] = useState(false); // 진짜 에디터 활성화
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [isTempDocCreated, setIsTempDocCreated] = useState(false);

  // [2] 진입 시 temp_docs 존재 여부 체크 (한 번만)
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
        setIsTempDocCreated(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  // 복원/취소 선택 시 원본/임시 불러오기
  const handleRestore = async () => {
    const doc = await getTempDocApi(id);
    setDocument(doc);
    setShowRestoreModal(false);
    setReady(true);
    setIsTempDocCreated(true);
  };
  const handleCancel = async () => {
    const doc = await getDocApi(id);
    setDocument(doc);
    setShowRestoreModal(false);
    setReady(true);
    setIsTempDocCreated(false);
  };

  // 문서 내용 반영 (원본/임시 불러온 뒤)
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setContents(document.contents || "");
    }
  }, [document]);

  // 입력 → 최초만 insert, 이후엔 patch
  const debouncedAutoSave = useRef(
    debounce(async (data: Partial<Document>) => {
      await autosave({ title: data.title, contents: data.contents });
      setIsTempDocCreated(true); // 최초 insert 후 patch 전환
    }, 3000)
  ).current;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isTempDocCreated) {
      autosave({ title: newTitle, contents }); // insert
      setIsTempDocCreated(true);
    } else {
      debouncedAutoSave({ title: newTitle, contents });
    }
  };

  const handleContentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContents = e.target.value;
    setContents(newContents);
    if (!isTempDocCreated) {
      autosave({ title, contents: newContents }); // insert
      setIsTempDocCreated(true);
    } else {
      debouncedAutoSave({ title, contents: newContents });
    }
  };

  // 저장 함수 부모에 전달
  useEffect(() => {
    if (onSaveReady) {
      onSaveReady(async () => {
        await finalizeDocument();
        setIsTempDocCreated(false); // 임시저장 플래그 리셋
        setShowRestoreModal(false); // 혹시 모달 남아있으면 닫기
        // 최신 원본 다시 로드
        fetchDocument();
      });
    }
  }, [finalizeDocument, onSaveReady, fetchDocument]);

  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  // ------------- UI --------------

  if (error) return <div className={styles.message}>에러: {error}</div>;
  if (loading || !ready) {
    return <div className={styles.message}>로딩 중...</div>;
  }
  if (!document) {
    return <div className={styles.message}>문서가 존재하지 않습니다.</div>;
  }

  return (
    <div className={styles.container}>
      {isSaving && <div className={styles.toast}> <FaSpinner className={styles.spinner} /> 임시 저장 중...</div>}
      {showRestoreModal && (
        <div className={styles.restoreModal}>
          <div className={styles.modalContent}>
            <p>이전에 임시저장된 편집본이 있습니다.<br />복원하시겠습니까?</p>
            <button onClick={handleRestore}>복원</button>
            <button onClick={handleCancel}>취소</button>
          </div>
        </div>
      )}
      <input
        type="text"
        className={styles.titleInput}
        value={title}
        onChange={handleTitleChange}
        placeholder="제목을 입력하세요"
        disabled={!ready}
      />
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
