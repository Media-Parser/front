// src/features/Suggestion/Suggestion.tsx
import { useState, useEffect } from "react";
import styles from "./Suggestion.module.css";
import suggestionImage from "../../assets/suggestionImg.png";
import { fetchSentenceAnalysisApi } from "../../lib/api/analyzeApi";
import type { SentenceAnalysis } from "../../types/analyzeType";

type SuggestionProps = { docId: string, contents: string };

const Suggestion = ({ docId, contents }: SuggestionProps) => {
  const [analysis, setAnalysis] = useState<SentenceAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchSentenceAnalysisApi(docId, contents)
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, [docId, contents]);

  const handleToggle = (idx: number) => {
    setOpenId((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className={styles.Wrapper}>
      <div className={styles.headerArea}>
        <h3 className={styles.heading}>
          <img src={suggestionImage} alt="Suggestion Icon" className={styles.image} />
        </h3>
      </div>
      <div className={styles.suggestionArea}>
        {loading ? (
          <div className={styles.analysisLoading}>분석 중...</div>
        ) : (
          <ul className={styles.suggestionList}>
            {analysis.filter(a => a.flag).map((sent, idx) => {
            const explanations = Array.isArray(sent.explanation)
              ? sent.explanation
              : sent.explanation
              ? [sent.explanation]
              : [];
            return (
              <li
                key={sent.index}
                className={`${styles.suggestionItem} ${openId === idx ? styles.open : ""}`}
                onClick={() => handleToggle(idx)}
              >
                <h4 className={styles.title}>
                  <span className={styles.highlighted}>
                    {sent.highlighted.join(", ") || sent.text}
                  </span>
                  {explanations.length > 0 && (
                    <span className={styles.explanation}>
                      [{explanations.join(", ")}]
                      </span>
                    )}
                  </h4>
                  {openId === idx && (
                  <p className={styles.description}>{sent.text}</p>
                )}
                <button className={styles.applyBtn}>적용하기</button>
              </li>
            );
          })}
          {analysis.filter(a => a.flag).length === 0 && (
            <div className={styles.noSuggestion}>
              부적합(수정 제안) 문장이 없습니다. 😊
            </div>
          )}
        </ul>
        )}
      </div>
      <div className={styles.noteArea}>
        <p className={styles.note}>
          {" "}문장별로 하이라이트된 부분과 라벨을 클릭해서 확인하세요.{" "}
        </p>
      </div>
    </div>
  );
};

export default Suggestion;
