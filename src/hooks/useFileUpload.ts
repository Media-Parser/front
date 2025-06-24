// 📁 src/hooks/useFileUpload.ts
// 설명: 파일 업로드를 처리하는 로직 분리
// 사용 위치: 파일 업로드 기능이 필요한 컴포넌트
import api from "../lib/api/api";
import { toast } from "react-hot-toast";

type UploadArgs = {
  file: File;
  userId: string;
  categoryId?: string | null;
};

export const useFileUpload = (onSuccess: (docId: string) => void) => {
  const uploadFile = async ({ file, userId, categoryId }: UploadArgs) => {
    const allowedExtensions = ["hwp", "hwpx"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error("hwp 또는 hwpx 파일만 업로드할 수 있습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);
    if (categoryId) formData.append("category_id", categoryId);

    const uploadUrl =
      fileExtension === "hwp"
        ? "/documents/upload/hwp"
        : "/documents/upload/hwpx";

    try {
      const res = await api.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // 응답에서 doc_id(문서 id) 추출
      const docId = (res.data && (res.data as any).doc_id) || "";
      if (!docId) {
        toast.error("문서 ID를 찾을 수 없습니다.");
        return;
      }
      onSuccess(docId);
      toast.success("업로드 성공");
    } catch (error) {
      toast.error("업로드 실패");
    }
  };

  return { uploadFile };
};