// src/features/Suggestion/Suggestion.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Suggestion.module.css";
import suggestionImage from "../../assets/suggestionImg.png";
import { fetchSentenceAnalysisApi } from "../../lib/api/analyzeApi";
import type { SentenceAnalysis } from "../../types/analyzeType";

type SuggestionProps = {
  docId: string;
  contents: string;
  shouldAnalyze: number; // 분석 트리거(숫자 키). 0이 아니면 분석 요청으로 간주.
  onAnalyzed?: () => void; // 분석 완료 후 호출될 콜백
};

// 라벨별 색상을 매핑하는 헬퍼 함수 (이전과 동일)
const getLabelColorClass = (label: string): string => {
    switch (label) {
        case "문제 없음": return "";
        case "프레이밍": return styles.labelColor_framing;
        case "감정적 비난": return styles.labelColor_emotionalCriticism;
        case "부정적 표현": return styles.labelColor_negativeExpression;
        case "부정적 비유": return styles.labelColor_negativeMetaphor;
        case "조롱/비아냥/풍자": return styles.labelColor_sarcasm;
        case "인신공격": return styles.labelColor_personalAttack;
        case "일반화": return styles.labelColor_generalization;
        case "단정/확증편향": return styles.labelColor_assertionBias;
        case "사실 여부 불명확": return styles.labelColor_unclearFact;
        case "책임 전가": return styles.labelColor_blameShifting;
        case "극단적 묘사": return styles.labelColor_extremeDepiction;
        default: return "";
    }
};

const Suggestion = ({ docId, contents, shouldAnalyze, onAnalyzed }: SuggestionProps) => {
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [flaggedSentences, setFlaggedSentences] = useState<SentenceAnalysis[]>([]); 

  // contents의 최신 값을 항상 참조하기 위한 ref
  const latestContentsRef = useRef(contents);

  // shouldAnalyze를 추적하기 위한 ref. shouldAnalyze !== lastRenderedAnalyzeId.current 로직은 제거.
  // key prop 때문에 컴포넌트가 리마운트될 때마다 이 ref는 초기화되므로, 매번 새로운 shouldAnalyze 값을 받음.
  // 대신, '이미 이 shouldAnalyze 값에 대한 분석을 시작했는지' 여부를 판별하는 데 집중.
  const lastAnalysisTriggeredValueRef = useRef(0); 

  // contents prop이 변경될 때마다 latestContentsRef 업데이트
  useEffect(() => {
    latestContentsRef.current = contents;
  }, [contents]);

  // 분석 로직을 캡슐화한 콜백 함수
  const performAnalysis = useCallback(async (currentTriggerValue: number) => {
    const currentContents = latestContentsRef.current;

    // 이미 이 트리거 값으로 분석을 시작했다면 중복 호출 방지
    if (currentTriggerValue === lastAnalysisTriggeredValueRef.current) {
      console.log(`[Suggestion-performAnalysis] 이미 이 트리거 값(${currentTriggerValue})으로 분석 중이거나 완료됨. 스킵.`);
      return;
    }
    
    // 분석 시작 직전, 현재 트리거 값을 기록
    lastAnalysisTriggeredValueRef.current = currentTriggerValue;

    if (!docId || !currentContents.trim()) {
      console.warn("[Suggestion-performAnalysis] 분석 요청 실패: docId 또는 contents가 유효하지 않습니다.");
      setLoading(false); 
      setFlaggedSentences([]);
      return;
    }

    console.log("🚀[Suggestion-API] 분석 API 호출!", { docId, contentsLen: currentContents.length, contents: currentContents });
    setLoading(true); 
    try {
      const result = await fetchSentenceAnalysisApi(docId, currentContents);
      console.log("✅[Suggestion-API] 분석 결과:", result);

      const filtered = result.filter(s => typeof s.flag === 'boolean' && s.flag === true);
      setFlaggedSentences(filtered);

      console.log(`[Suggestion-Filter] Total sentences: ${result.length}, Flagged sentences count: ${filtered.length}`, filtered);

      if (onAnalyzed) onAnalyzed();

    } catch (error) {
      console.error("[Suggestion-API] 분석 API 호출 에러:", error);
      setFlaggedSentences([]);
    } finally {
      setLoading(false); 
    }
  }, [docId, onAnalyzed]); // latestContentsRef는 current로, loading은 내부에서만 제어.

  // shouldAnalyze 값이 변경될 때만 분석을 트리거하는 useEffect
  useEffect(() => {
    console.log(`[Suggestion-Effect] Start check: shouldAnalyze=${shouldAnalyze}, loading=${loading}, docId=${docId}, lastAnalysisTriggeredValue=${lastAnalysisTriggeredValueRef.current}`);

    // shouldAnalyze가 0이면 분석 시작 안 함 (초기 상태이거나 리셋된 상태)
    if (shouldAnalyze === 0) { 
        console.log(`[Suggestion-Effect] Condition unmet (shouldAnalyze is 0): shouldAnalyze=${shouldAnalyze}`);
        return; 
    }

    // 현재 shouldAnalyze 값이 이전에 분석 시작했던 값과 다르고, 로딩 중이 아닐 때만 performAnalysis 호출
    // key prop 때문에 컴포넌트가 리마운트되면 lastAnalysisTriggeredValueRef.current는 0이므로 이 조건은 통과됨.
    if (shouldAnalyze !== lastAnalysisTriggeredValueRef.current && !loading) {
        performAnalysis(shouldAnalyze); // shouldAnalyze 값을 performAnalysis에 전달
    } else {
        console.log(`[Suggestion-Effect] Already loading or same trigger: shouldAnalyze=${shouldAnalyze}, loading=${loading}, lastAnalysisTriggeredValue=${lastAnalysisTriggeredValueRef.current}`);
    }
  }, [shouldAnalyze, docId, loading, performAnalysis]); // performAnalysis도 의존성에 추가

  const handleToggle = (sentenceIndex: number) => {
    setOpenIndex((prev) => (prev === sentenceIndex ? null : sentenceIndex));
  };

  // 헬퍼 함수: 문장 내용에서 하이라이트된 부분을 찾아 JSX 노드로 렌더링 (이전과 동일)
  const renderHighlightedText = (text: string, highlighted: string[], label: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const labelColorClass = getLabelColorClass(label);

    highlighted.forEach((hl, i) => {
      let startIndex = text.indexOf(hl, lastIndex);
      if (startIndex === -1) { 
          startIndex = text.indexOf(hl); 
          if (startIndex === -1 || startIndex < lastIndex) return; 
      }

      if (startIndex !== -1) {
        if (startIndex > lastIndex) {
          parts.push(<span key={`plain-${lastIndex}-${i}`}>{text.substring(lastIndex, startIndex)}</span>);
        }

        parts.push(
          <span key={`hl-${startIndex}-${i}`} className={`${styles.inlineHighlighted} ${labelColorClass}`}>
            {hl}
          </span>
        );
        lastIndex = startIndex + hl.length;
      }
    });

    if (lastIndex < text.length) {
      parts.push(<span key={`plain-end-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? <>{parts}</> : <>{text}</>;
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
            {flaggedSentences.length > 0 ? ( 
              flaggedSentences.map((sent) => {
                const explanations = sent.explanation;
                const displayExplanation = explanations.join(", ");
                const isOpen = openIndex === sent.index;

                return (
                  <li
                    key={sent.index}
                    className={`${styles.suggestionItem} ${isOpen ? styles.open : ""}`}
                    onClick={() => handleToggle(sent.index)}
                  >
                    <h4 className={styles.title}>
                      <span className={styles.sentenceTextContainer}>
                          {renderHighlightedText(sent.text, sent.highlighted, sent.label)}
                      </span>
                    </h4>
                    {isOpen && (
                      <>
                        {displayExplanation.length > 0 && (
                          <p className={styles.explanationBlock}>
                            <span className={styles.explanationIcon}>&#9888;</span>
                            {displayExplanation}
                          </p>
                        )}
                      </>
                    )}
                  </li>
                );
              })
            ) : (
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