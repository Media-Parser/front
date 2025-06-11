// 📁 store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import documentReducer from './slices/documentSlice';
import trashReducer from "./slices/trashSlice"; // 추가

export const store = configureStore({
  reducer: {
    document: documentReducer,
    trash: trashReducer, 
    // 앞으로 추가될 trash, ui 등도 여기에!
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
