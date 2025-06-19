// 📁 src/store/documentStore.ts
import { create } from "zustand";
import type { Document } from "../types/documentType";

interface DocumentState {
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  updateDocument: (updated: Partial<Document> & { doc_id: string }) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  setDocuments: (docs) => set({ documents: docs }),

  updateDocument: (updatedDoc) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.doc_id === updatedDoc.doc_id ? { ...doc, ...updatedDoc } : doc
      ),
    })),
}));
