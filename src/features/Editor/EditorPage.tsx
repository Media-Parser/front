// 📁 src/features/Editor/EditorPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Editor.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loadDocuments } from "../../store/slices/documentSlice";
import ChatBot from "./ChatBot";

const EditorPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
  
    const document = useAppSelector((state) =>
      state.document.documents.find((doc) => doc.id === id)
    );
  
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
  
    useEffect(() => {
      if (document) {
        setTitle(document.title);
        setContent("샘플 내용입니다");
      }
    }, [document]);
  
    const handleSave = () => {
      setIsSaving(true);
      dispatch(loadDocuments());
      setTimeout(() => {
        setIsSaving(false);
        alert("저장되었습니다!");
        navigate("/dashboard");
      }, 500);
    };
  
    return (
      <div className={styles.container}>
        <div className={styles.editorArea}>
          <input
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className={styles.contentArea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className={styles.buttonGroup}>
            <button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </button>
            <button onClick={() => navigate("/dashboard")}>취소</button>
          </div>
        </div>
  
        <div className={styles.chatArea}>
          <ChatBot />
        </div>
      </div>
    );
  };
  
  export default EditorPage;