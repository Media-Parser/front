// 📁 src/features/Suggestion/Suggestion.tsx
import { useState, useCallback } from "react";
// import { useParams } from "react-router-dom";
import styles from "./Suggestion.module.css";
import suggestionImage from "../../assets/suggestionImg.png";

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
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.Wrapper}>
      <div className={styles.headerArea}>
        <h3 className={styles.heading}>
          <img
            src={suggestionImage}
            alt="Suggestion Icon"
            className={styles.image}
          />
        </h3>{" "}
      </div>
      <div className={styles.suggestionArea}>
        <ul className={styles.suggestionList}>
          {dummySuggestions.map((sug) => (
            <li
              key={sug.id}
              className={`${styles.suggestionItem} ${
                openId === sug.id ? styles.open : ""
              }`}
              onClick={() => handleToggle(sug.id)}
            >
              <h4 className={styles.title}>{sug.title}</h4>
              {openId === sug.id && (
                <p className={styles.description}>{sug.description}</p>
              )}
              <button className={styles.applyBtn}>적용하기</button>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.noteArea}>
        <p className={styles.note}>
          {" "}
          이 문서는 다소 보수적으로 작성되어 있습니다.{" "}
        </p>
      </div>
    </div>
  );
};

export default Suggestion;
