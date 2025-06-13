// src/lib/utils/groupDocumentsByDate.ts
import dayjs from "dayjs";

export function groupDocumentsByDate(documents: any[]) {
  const groups: { [label: string]: any[] } = {};
  const now = dayjs();

  documents.forEach((doc) => {
    const date = dayjs(doc.date); // doc.date는 Date/String
    let label = "";

    if (now.isSame(date, 'day')) {
      label = "Today";
    } else if (now.subtract(1, 'day').isSame(date, 'day')) {
      label = "Yesterday";
    } else if (now.diff(date, 'day') < 7) {
      label = "Previous 7 Days";
    } else if (now.diff(date, 'day') < 30) {
      label = "Previous 30 Days";
    } else {
      label = date.format("MMMM"); // 예: May, June
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(doc);
  });

  return groups;
}
