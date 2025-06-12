// src/store/slices/documentDetailSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Document } from "../../types/documents";

interface RightClickDetailState {
  open: boolean;
  document?: Document;
}

const initialState: RightClickDetailState = {
  open: false,
};

const rightClickDetailSlice = createSlice({
  name: "rightClickDetail",
  initialState,
  reducers: {
    openDetail(state, action: PayloadAction<Document>) {
      state.open = true;
      state.document = action.payload;
    },
    closeDetail(state) {
      state.open = false;
      state.document = undefined;
    },
  },
});

export const { openDetail, closeDetail } = rightClickDetailSlice.actions;
export default rightClickDetailSlice.reducer;
