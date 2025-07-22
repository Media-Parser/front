// src/lib/api/analyzeApi.ts
import { api } from "./api";
import type { SentenceAnalysis } from "../../types/analyzeType";

type AnalyzeResponse = { sentences: SentenceAnalysis[] };

export const fetchSentenceAnalysisApi = async (docId: string, contents: string): Promise<SentenceAnalysis[]> => {
    const res = await api.post(`/analyze`, { doc_id: docId, contents });
    const data = res.data as AnalyzeResponse;
    // 백엔드에서 explanation과 highlighted가 항상 배열로 오므로, 추가 변환 로직 간소화
    return data.sentences.map((item) => ({
        ...item,
        // explanation은 이미 string[] 타입으로 예상되므로, 불필요한 변환 제거
        // 만약 여전히 string | string[] 로 올 가능성이 있다면, 타입 가드 유지
        explanation: item.explanation as string[], // ✅ 타입 단언 또는 런타임 체크 제거
        highlighted: item.highlighted, // ✅ 이미 string[]이므로 그대로 사용
    }));
};