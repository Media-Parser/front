// src/hooks/useFileUpload.ts
// 설명: 파일 업로드를 처리하는 로직 분리
// 사용 위치: 파일 업로드 기능이 필요한 컴포넌트
import axios from "axios";

// 파일 업로드 커스텀 훅
export const useFileUpload = (onSuccess: () => void) => {
  const uploadFile = async (file: File) => {
    const allowedExtensions = ["hwp", "hwpx"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert("hwp 또는 hwpx 파일만 업로드할 수 있습니다.");
      return;
    }

    // 확장자별 API 경로 분기
    let uploadUrl = "";
    if (fileExtension === "hwp") {
      uploadUrl = "/documents/upload/hwp";
    } else if (fileExtension === "hwpx") {
      uploadUrl = "/documents/upload/hwpx";
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onSuccess();
    } catch (error) {
      console.error("업로드 실패", error);
    }
  };

  return { uploadFile };
};