// src/lib/utils/groupDocumentsByDate.ts
import dayjs from "dayjs";
import type { Document } from "../../types/documents_type";

export function groupDocumentsByDate(documents: Document[]) {
  const groups: { [label: string]: Document[] } = {};
  const now = dayjs();

  documents.forEach((doc) => {
    const date = dayjs(doc.created_dt);
    let label = "";

    if (now.isSame(date, "day")) {
      label = "Today";
    } else if (now.subtract(1, "day").isSame(date, "day")) {
      label = "Yesterday";
    } else if (now.diff(date, "day") < 7) {
      label = "Previous 7 Days";
    } else if (now.diff(date, "day") < 30) {
      label = "Previous 30 Days";
    } else if (now.year() === date.year()) {
      label = date.format("MMM"); // Jan, Feb, Mar, ...
    } else {
      const yearDiff = now.year() - date.year();
      label = yearDiff === 1 ? "1 year ago" : `${yearDiff} years ago`;
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(doc);
  });

  return groups;
}
