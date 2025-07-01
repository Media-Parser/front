// src/components/Modal/DownloadDocModal.tsx
import styles from "./DownloadDocModal.module.css";
import { createPortal } from "react-dom";

interface DownloadDocModalProps {
  open: boolean; // 모달 오픈 여부
  onConfirm: () => void; // "확인" (에디터로 이동)
  onDownload: () => void; // "다운로드" (기존 다운로드)
  onClose?: () => void; // 바깥 클릭 등 닫기용(선택)
}

const DownloadDocModal = ({
  open,
  onConfirm,
  onDownload,
  onClose,
}: DownloadDocModalProps) => {

  if (!open) return null;

  return createPortal(
  (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>저장되지 않은 수정내용이 있습니다.</div>
        <div className={styles.desc}>문서를 확인하시겠습니까?</div>
        <div className={styles.btnGroup}>
          <button className={styles.btn} onClick={onConfirm}>
            확인(에디터로)
          </button>
          <button className={styles.btn} onClick={onDownload}>
            다운로드
          </button>
        </div>
      </div>
    </div>
  ),
    document.body
  );
};

export default DownloadDocModal;
