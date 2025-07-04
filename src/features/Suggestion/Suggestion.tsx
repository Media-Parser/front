// // 📁 src/features/Suggestion/Suggestion.tsx
// import { useState, useCallback } from "react";
// import { useParams } from "react-router-dom";
import styles from "./Suggestion.module.css";

type SuggestionProps = {
  docId: string;
};

const dummySuggestions = [
  {
    id: "1",
    title: "문서 도입부가 부족해요",
    description:
      "도입부에서 독자의 주의를 끌 수 있는 간단한 문제 제기나 배경 설명을 추가해보세요.",
  },
  {
    id: "2",
    title: "문장 길이가 너무 길어요",
    description: "긴 문장을 짧게 나누어 가독성을 높일 수 있어요.",
  },
];

const Suggestion = ({ docId }: SuggestionProps) => {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>📝 제안 사항</h3>
      <ul className={styles.suggestionList}>
        {dummySuggestions.map((sug) => (
          <li key={sug.id} className={styles.suggestionItem}>
            <h4 className={styles.title}>{sug.title}</h4>
            <p className={styles.description}>{sug.description}</p>
            <button className={styles.applyBtn}>적용하기</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Suggestion;
