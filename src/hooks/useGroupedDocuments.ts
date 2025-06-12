// src/hooks/useGroupedDocuments.ts
//설명: 문서를 불러오고, 날짜별로 그룹화하며, 검색 필터링까지 수행하는 커스텀 훅
//사용 위치: DashboardPage 뿐만 아니라, 문서 목록이 필요한 다른 페이지에서도 재사용 가능

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import type { Document } from "../types/documents";

export const useGroupedDocuments = (searchTerm: string) => {
  const [groupedDocs, setGroupedDocs] = useState<Record<string, Document[]>>({});

  const loadDocuments = async () => {
    try {
      const res = await axios.get<Document[]>("/documents");
      const docs = res.data;

      const filtered = docs.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const grouped: Record<string, Document[]> = {};
      filtered.forEach((doc) => {
        if (!grouped[doc.date]) grouped[doc.date] = [];
        grouped[doc.date].push(doc);
      });

      const sortedGrouped = Object.fromEntries(
        Object.entries(grouped).sort((a, b) => (dayjs(b[0]).isAfter(dayjs(a[0])) ? 1 : -1))
      );

      setGroupedDocs(sortedGrouped);
    } catch (err) {
      console.error("문서 불러오기 실패", err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [searchTerm]);

  return { groupedDocs, reload: loadDocuments };
};
