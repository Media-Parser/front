// src/types/analyzeType.ts
export interface SentenceAnalysis {
  index: number;                    // 문장 인덱스
  text: string;                     // 전체 문장
  flag: boolean;                    // 부적합/적합
  highlighted: [string?, string?];  // 부적합 부분(배열, 여러개 가능)
  explanation: [string?, string?];  // 라벨(배열, 여러개 가능)
}