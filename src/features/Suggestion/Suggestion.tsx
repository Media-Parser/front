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
  // openId는 이제 문장 자체의 고유 인덱스(sent.index)를 저장하도록 변경
  const [openIndex, setOpenIndex] = useState<number | null>(null); // ✅ openId -> openIndex 변경

  useEffect(() => {
    setLoading(true);
    // docId나 contents가 변경될 때마다 API 호출
    fetchSentenceAnalysisApi(docId, contents)
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, [docId, contents]); // contents 의존성 추가는 문장이 수정될 때마다 분석을 재요청하려는 의도라면 적절합니다.

  // handleToggle은 문장의 고유 index를 받도록 변경
  const handleToggle = (sentenceIndex: number) => { // ✅ idx -> sentenceIndex 변경
    setOpenIndex((prev) => (prev === sentenceIndex ? null : sentenceIndex)); // ✅ setOpenId -> setOpenIndex 변경
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
            {/* key와 handleToggle에 sent.index를 사용하도록 수정 */}
            {analysis.filter(a => a.flag).map((sent) => { // ✅ idx 제거
              // 백엔드에서 explanation은 이제 항상 string[] 이므로 Array.isArray 체크 불필요
              const explanations = sent.explanation; // ✅ 타입 보장 (string[]으로 옴)
              const displayExplanation = explanations.join(", "); // ✅ string[].join() 바로 사용

              return (
                <li
                  key={sent.index} // ✅ sent.index를 key로 사용
                  className={`${styles.suggestionItem} ${openIndex === sent.index ? styles.open : ""}`} // ✅ openId -> openIndex, idx -> sent.index
                  onClick={() => handleToggle(sent.index)} // ✅ idx -> sent.index
                >
                  <h4 className={styles.title}>
                    <span className={styles.highlighted}>
                      {/* highlighted는 이제 항상 string[] 이므로 join() 바로 사용 */}
                      {sent.highlighted.join(", ") || sent.text} {/* ✅ join() 바로 사용 */}
                    </span>
                    {/* explanation이 있을 경우에만 표시 */}
                    {displayExplanation.length > 0 && ( // ✅ displayExplanation.length로 체크
                      <span className={styles.explanation}>
                        [{displayExplanation}] {/* ✅ displayExplanation 바로 사용 */}
                      </span>
                    )}
                  </h4>
                  {openIndex === sent.index && ( // ✅ openId -> openIndex, idx -> sent.index
                    <p className={styles.description}>{sent.text}</p>
                  )}
                  {/* TODO: '적용하기' 버튼 로직 구현 필요 */}
                  {/* <button className={styles.applyBtn}>적용하기</button> */}
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