// src/types/analyzeType.ts
export interface SentenceAnalysis {
  index: number;            // 문장 인덱스
  text: string;             // 문장 전체 텍스트
  flag: boolean;            // true(부적합) / false(적합)
  label: string;            // 라벨
  highlighted: string[];    // 부적합일 경우 하이라이트 부분(배열)
  explanation: string[];    // ✅ 사유 라벨(복수 가능), 이제 항상 배열로 옴
}

