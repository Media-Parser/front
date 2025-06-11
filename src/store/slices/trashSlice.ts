/* 📁 src/store/slices/trashSlice.ts */
// 휴지통 관련 문서 상태 관리 (휴지통 문서 로드, 복원 등)

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { fetchDocuments, updateDeleteYn } from "../../api/documentAPI";
import type { Document } from "../../types/documents";

interface TrashState {
  trashDocuments: Document[];
  loading: boolean;
  error?: string;
}

const initialState: TrashState = {
  trashDocuments: [],
  loading: false,
};

export const loadTrashDocuments = createAsyncThunk(
  "trash/loadTrashDocuments",
  async (_, thunkAPI) => {
    try {
      const response = await fetchDocuments(true);
      return response.data;
    } catch {
      return thunkAPI.rejectWithValue("휴지통 문서 불러오기 실패");
    }
  }
);

export const restoreFromTrash = createAsyncThunk(
  "trash/restoreFromTrash",
  async (docId: string, thunkAPI) => {
    try {
      await updateDeleteYn(docId, false);
      return docId;
    } catch {
      return thunkAPI.rejectWithValue("복원 실패");
    }
  }
);

const trashSlice = createSlice({
  name: "trash",
  initialState,
  reducers: {
    addToTrash(state, action: PayloadAction<Document>) {
      state.trashDocuments.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTrashDocuments.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loadTrashDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.trashDocuments = action.payload;
      })
      .addCase(loadTrashDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(restoreFromTrash.fulfilled, (state, action) => {
        state.trashDocuments = state.trashDocuments.filter(doc => doc.id !== action.payload);
      });
  },
});

export const { addToTrash } = trashSlice.actions;
export default trashSlice.reducer;
