/* 📁 src/store/slices/documentSlice.ts */
// 일반 문서 상태 관리 (문서 로드, 휴지통 이동 등)

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { fetchDocuments, updateDeleteYn } from "../../api/documentAPI";
import type { Document } from "../../types/documents";
import { addToTrash } from "../slices/trashSlice";

// 일반 문서 상태 타입 정의
interface DocumentState {
  documents: Document[]; // 일반 문서 목록
  loading: boolean;      // 로딩 상태
  error?: string;        // 에러 메시지
}

// 초기 상태
const initialState: DocumentState = {
  documents: [],
  loading: false,
};

// [비동기] 일반 문서 불러오기 (deleteYn = false)
export const loadDocuments = createAsyncThunk(
  "document/loadDocuments",
  async (_, thunkAPI) => {
    try {
      const response = await fetchDocuments(false); // 삭제되지 않은 문서만 요청
      return response.data;
    } catch {
      return thunkAPI.rejectWithValue("문서 불러오기 실패");
    }
  }
);

// [비동기] 문서를 휴지통으로 이동 (deleteYn = true)
export const moveToTrash = createAsyncThunk(
  "document/moveToTrash",
  async (doc: Document, thunkAPI) => {
    try {
      await updateDeleteYn(doc.id, true); // 삭제 플래그 true 설정
      thunkAPI.dispatch(addToTrash(doc)); // ✅ 휴지통에도 직접 추가
      return doc;
    } catch {
      return thunkAPI.rejectWithValue("휴지통 이동 실패");
    }
  }
);

// documentSlice 정의
const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    // 외부에서 문서 배열을 설정할 때 사용
    setDocuments(state, action: PayloadAction<Document[]>) {
      state.documents = action.payload;
    },
    // 특정 문서를 ID 기준으로 삭제
    deleteDocument(state, action: PayloadAction<string>) {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // 문서 로딩 시작
      .addCase(loadDocuments.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      // 문서 로딩 성공
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      // 문서 로딩 실패
      .addCase(loadDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 문서를 휴지통으로 옮긴 후 리스트에서 제거
      .addCase(moveToTrash.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload.id);
      })
      // 휴지통 이동 실패
      .addCase(moveToTrash.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 액션과 리듀서 내보내기
export const { setDocuments, deleteDocument } = documentSlice.actions;
export default documentSlice.reducer;
