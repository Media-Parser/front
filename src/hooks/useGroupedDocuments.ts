// src/hooks/useGroupedDocuments.ts
//설명: 문서를 불러오고, 날짜별로 그룹화하며, 검색 필터링까지 수행하는 커스텀 훅
//사용 위치: DashboardPage 뿐만 아니라, 문서 목록이 필요한 다른 페이지에서도 재사용 가능
import { useMemo } from "react";
import dayjs from "dayjs";
import type { Document } from "../types/documents_type";

export const useGroupedDocuments = (searchTerm: string, documents: Document[]) => {
  // useMemo로 불필요한 연산 방지
  const groupedDocs = useMemo(() => {
    // 검색어 필터
    const filtered = documents.filter((doc) =>
      (doc.title ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 날짜별 그룹화
    const grouped: Record<string, Document[]> = {};
    filtered.forEach((doc) => {
      const date = doc.date || "미지정";
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(doc);
    });

    // 날짜 내림차순 정렬
    return Object.fromEntries(
      Object.entries(grouped).sort((a, b) => (dayjs(b[0]).isAfter(dayjs(a[0])) ? 1 : -1))
    );
  }, [documents, searchTerm]);

  return { groupedDocs };
};
