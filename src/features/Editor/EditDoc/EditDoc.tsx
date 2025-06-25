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
    setIsTempDocCreated(false); // 새로 들어왔으니 플래그 초기화
  }, [id, fetchDocument]);

  // ---------------- 상태들 ----------------
  const [showRestoreModal, setShowRestoreModal] = useState(false); // 임시저장 복원 모달
  const [ready, setReady] = useState(false); // 렌더 준비 여부
  const [title, setTitle] = useState(""); // 문서 제목
  const [contents, setContents] = useState(""); // 문서 내용
  const [isTempDocCreated, setIsTempDocCreated] = useState(false); // 최초 insert 여부 판단

  // -------------- 임시저장 존재 여부 확인 ---------------
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
        if (isMounted) setReady(true); // 렌더링 가능 상태로 변경
        setIsTempDocCreated(false); // 항상 초기화
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ----------- 복원/취소 선택 시 로직 --------------
  const handleRestore = async () => {
    const doc = await getTempDocApi(id); // 임시문서 불러오기
    setDocument(doc);
    setShowRestoreModal(false);
    setReady(true);
    setIsTempDocCreated(true); // 이미 임시 저장된 상태
  };

  const handleCancel = async () => {
    const doc = await getDocApi(id); // 원본문서 불러오기
    setDocument(doc);
    setShowRestoreModal(false);
    setReady(true);
    setIsTempDocCreated(false);
  };

  // -------------- 문서 불러온 뒤 입력 필드 반영 ---------------
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setContents(document.contents || "");
    }
  }, [document]);

  // -------------- 디바운스된 자동 저장 로직 (3초) --------------
  const debouncedAutoSave = useRef(
    debounce(async (data: Partial<Document>) => {
      await autosave({ title: data.title, contents: data.contents });
      setIsTempDocCreated(true); // 최초 insert 후엔 patch만 하게
    }, 3000)
  ).current;

  // 제목 변경 핸들러
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    debouncedAutoSave({ title: newTitle, contents });
  };

  // 본문 변경 핸들러
  const handleContentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContents = e.target.value;
    setContents(newContents);

    debouncedAutoSave({ title, contents: newContents });
  };

  // ----------- 부모에게 저장 함수 전달 ------------
  // EditDoc.tsx
  useEffect(() => {
    if (onSaveReady) {
      onSaveReady(async () => {
        // 1. 디바운스 즉시 실행
        debouncedAutoSave.flush();

        // 2. 디바운스 안의 autosave가 끝날 때까지 잠깐 기다리기
        await new Promise((resolve) => setTimeout(resolve, 50)); // 💡 50~100ms는 flush 직후를 커버

        // 3. finalize 실행
        await finalizeDocument();
        setIsTempDocCreated(false);
        setShowRestoreModal(false);
        fetchDocument();
      });
    }
  }, [debouncedAutoSave, finalizeDocument, onSaveReady, fetchDocument]);

  // 컴포넌트 사라질 때 디바운스된 작업 취소
  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  // ---------------- 렌더링 조건 처리 ----------------
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
      {/* 저장 중일 때 토스트 표시 */}
      {isSaving && (
        <div className={styles.toast}>
          <FaSpinner className={styles.spinner} /> 임시 저장 중...
        </div>
      )}

      {/* 임시 저장 복원 모달 */}
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
