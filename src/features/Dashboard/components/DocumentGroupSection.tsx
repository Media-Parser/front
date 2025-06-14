// src/features/Dashboard/components/DocumentGroupSection.tsx
import { useState } from "react";
import DocumentCard from "../../../components/DocumentCard/DocumentCard";
import styles from "./DocumentGroupSection.module.css";

interface DocumentGroupSectionProps {
  groupLabel: string;
  documents: any[];
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  isTrashPage?: boolean;
}

const PREVIEW_COUNT = 3;

const DocumentGroupSection = ({
  groupLabel,
  documents,
  onDelete,
  onDownload,
  onRestore,
  onPermanentDelete,
  isTrashPage,
}: DocumentGroupSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  const previewDocs = showAll ? documents : documents.slice(0, PREVIEW_COUNT);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.groupLabel}>{groupLabel}</h3>
        {documents.length > PREVIEW_COUNT && !showAll && (
          <button className={styles.button} onClick={() => setShowAll(true)}>
            Show All ({documents.length})
          </button>
        )}
        {showAll && (
          <button className={styles.button} onClick={() => setShowAll(false)}>
            Collapse
          </button>
        )}
      </div>
      <div className={styles.cardGrid}>
        {previewDocs.map((doc) => (
          <DocumentCard
            key={doc.id ?? doc._id}
            {...doc}
            onDelete={() => onDelete?.(doc.id ?? doc._id)}
            onDownload={() => onDownload?.(doc.id ?? doc._id)}
            onRestore={() => onRestore?.(doc.id ?? doc._id)}
            onPermanentDelete={() => onPermanentDelete?.(doc.id ?? doc._id)}
            isTrashPage={isTrashPage}
          />
        ))}
      </div>
    </section>
  );
};

export default DocumentGroupSection;
