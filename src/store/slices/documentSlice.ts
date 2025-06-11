/* 📁 src/store/slices/documentSlice.ts */
// 일반 문서 상태 관리 (문서 로드, 휴지통 이동 등)

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { fetchDocuments, updateDeleteYn } from "../../api/documentAPI";
import type { Document } from "../../types/documents";

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error?: string;
}

const initialState: DocumentState = {
  documents: [],
  loading: false,
};

export const loadDocuments = createAsyncThunk(
  "document/loadDocuments",
  async (_, thunkAPI) => {
    try {
      const response = await fetchDocuments(false);
      return response.data;
    } catch {
      return thunkAPI.rejectWithValue("문서 불러오기 실패");
    }
  }
);

export const moveToTrash = createAsyncThunk(
  "document/moveToTrash",
  async (doc: Document, thunkAPI) => {
    try {
      await updateDeleteYn(doc.id, true);
      return doc;
    } catch {
      return thunkAPI.rejectWithValue("휴지통 이동 실패");
    }
  }
);

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setDocuments(state, action: PayloadAction<Document[]>) {
      state.documents = action.payload;
    },
    deleteDocument(state, action: PayloadAction<string>) {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDocuments.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(loadDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(moveToTrash.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload.id);
      })
      .addCase(moveToTrash.rejected, (state, action) => {
        state.error = action.payload as string;
      })
  },
});

export const { setDocuments, deleteDocument } = documentSlice.actions;
export default documentSlice.reducer;