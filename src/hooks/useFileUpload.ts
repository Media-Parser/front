// src/hooks/useFileUpload.ts
// 설명: 파일 업로드를 처리하는 로직 분리
// 사용 위치: 파일 업로드 기능이 필요한 컴포넌트
import axios from "axios";

export const useFileUpload = (onSuccess: () => void) => {
  const uploadFile = async (file: File) => {
    const allowedExtensions = ["hwp", "hwpx"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert("hwp 또는 hwpx 파일만 업로드할 수 있습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/documents/upload", formData);
      onSuccess();
    } catch (error) {
      console.error("업로드 실패", error);
    }
  };

  return { uploadFile };
};
