// src/lib/api/analyzeApi.ts
import { api } from "./api";
import type { SentenceAnalysis } from "../../types/analyzeType";

type AnalyzeResponse = { sentences: SentenceAnalysis[] };

export const fetchSentenceAnalysisApi = async (docId: string, contents: string): Promise<SentenceAnalysis[]> => {
    const res = await api.post(`/analyze`, { doc_id: docId, contents });
    const data = res.data as AnalyzeResponse;
    return (data.sentences).map((item) => ({
        ...item,
        explanation: Array.isArray(item.explanation)
            ? item.explanation
            : item.explanation
            ? [item.explanation]
            : [],
    }));
};