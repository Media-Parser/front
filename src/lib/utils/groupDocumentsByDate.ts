// src/lib/utils/groupDocumentsByDate.ts
import dayjs from "dayjs";
import type { Document } from "../../types/documentType";

export function groupDocumentsByDate(documents: Document[]) {
  const now = dayjs();
  const groupMap = new Map<
    string,
    { documents: Document[]; sortDate: dayjs.Dayjs }
  >();

  documents.forEach((doc) => {
    const date = dayjs(doc.created_dt);
    let label = "";
    let sortDate = date;

    if (now.isSame(date, "day")) {
      label = "Today";
      sortDate = now;
    } else if (now.subtract(1, "day").isSame(date, "day")) {
      label = "Yesterday";
      sortDate = now.subtract(1, "day");
    } else if (now.diff(date, "day") < 7) {
      label = "Previous 7 Days";
      sortDate = now.subtract(3, "day");
    } else if (now.diff(date, "day") < 30) {
      label = "Previous 30 Days";
      sortDate = now.subtract(10, "day");
    } else if (now.year() === date.year()) {
      label = date.format("MMM"); // Jan, Feb, ...
      sortDate = dayjs(`${now.year()}-${date.month() + 1}-01`);
    } else {
      const yearDiff = now.year() - date.year();
      label = yearDiff === 1 ? "1 year ago" : `${yearDiff} years ago`;
      sortDate = dayjs(`${date.year()}-01-01`);
    }

    if (!groupMap.has(label)) {
      groupMap.set(label, { documents: [], sortDate });
    }

    groupMap.get(label)!.documents.push(doc);
  });

  // 정렬된 그룹 객체 반환
  const sortedEntries = [...groupMap.entries()]
    .sort((a, b) => b[1].sortDate.unix() - a[1].sortDate.unix())
    .map(([label, { documents }]) => [label, documents]);

  return Object.fromEntries(sortedEntries) as { [label: string]: Document[] };
}
