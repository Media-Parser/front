/* 📁 src/store/slices/trashSlice.ts */
// 휴지통 관련 문서 상태 관리 (휴지통 문서 로드, 복원 등)

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { fetchDocuments, updateDeleteYn } from "../../api/documentAPI";
import type { Document } from "../../types/documents";

// 휴지통 상태 타입 정의
interface TrashState {
  trashDocuments: Document[]; // 휴지통에 있는 문서 목록
  loading: boolean;           // 로딩 상태
  error?: string;             // 에러 메시지 (옵션)
}

// 초기 상태
const initialState: TrashState = {
  trashDocuments: [],
  loading: false,
};

// [비동기] 휴지통 문서 불러오기 (deleteYn = true)
export const loadTrashDocuments = createAsyncThunk(
  "trash/loadTrashDocuments",
  async (_, thunkAPI) => {
    try {
      const response = await fetchDocuments(true); // 삭제된 문서만 요청
      return response.data;
    } catch {
      return thunkAPI.rejectWithValue("휴지통 문서 불러오기 실패");
    }
  }
);

// [비동기] 문서를 휴지통에서 복원 (deleteYn = false)
export const restoreFromTrash = createAsyncThunk(
  "trash/restoreFromTrash",
  async (docId: string, thunkAPI) => {
    try {
      await updateDeleteYn(docId, false);
      return docId; // 성공 시 문서 ID 반환
    } catch {
      return thunkAPI.rejectWithValue("복원 실패");
    }
  }
);

// trashSlice 정의
const trashSlice = createSlice({
  name: "trash",
  initialState,
  reducers: {
    // 문서를 수동으로 휴지통에 추가할 때 사용 가능 (예비용)
    addToTrash(state, action: PayloadAction<Document>) {
      state.trashDocuments.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // 문서 로딩 시작
      .addCase(loadTrashDocuments.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      // 문서 로딩 성공
      .addCase(loadTrashDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.trashDocuments = action.payload;
      })
      // 문서 로딩 실패
      .addCase(loadTrashDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 복원 성공 시 해당 문서를 목록에서 제거
      .addCase(restoreFromTrash.fulfilled, (state, action) => {
        state.trashDocuments = state.trashDocuments.filter(doc => doc.id !== action.payload);
      });
  },
});

// 액션과 리듀서 내보내기
export const { addToTrash } = trashSlice.actions;
export default trashSlice.reducer;
