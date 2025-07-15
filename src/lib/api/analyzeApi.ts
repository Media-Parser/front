// src/lib/api/analyzeApi.ts
import { api } from "./api";
import type { SentenceAnalysis } from "../../types/analyzeType";

type AnalyzeResponse = { sentences: SentenceAnalysis[] };

export const fetchSentenceAnalysisApi = async (
    docId: string,
    contents: string
): Promise<SentenceAnalysis[]> => {
    const res = await api.post(`/analyze`, { doc_id: docId, contents });
    const data = res.data as AnalyzeResponse;
    return (data.sentences).map((item, idx) => ({
    ...item,
    index: item.index ?? idx,
    explanation: Array.isArray(item.explanation)
        ? item.explanation
        : item.explanation
        ? [item.explanation]
        : [],
    highlighted: Array.isArray(item.highlighted)
        ? item.highlighted
        : item.highlighted
        ? [item.highlighted]
        : [],
    flag: !!(item.flag), // boolean 변환 보장
    }));
};