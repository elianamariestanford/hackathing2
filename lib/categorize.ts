const ACADEMIC_KWS = [
    "class",
    "lecture",
    "lab",
    "office hours",
    "oh",
    "discussion",
    "study",
    "seminar",
    "section",
    "review",
    "midterm",
    "final",
    "exam",
  ];
  
  const SOCIAL_KWS = [
    "party",
    "dinner",
    "drinks",
    "hang",
    "date",
    "birthday",
    "brunch",
    "concert",
    "game night",
  ];
  
  export type Category = "Academic" | "Social" | "Other";
  
  export function categorize(title: string): Category {
    const t = (title || "").toLowerCase();
    if (ACADEMIC_KWS.some((k) => t.includes(k))) return "Academic";
    if (SOCIAL_KWS.some((k) => t.includes(k))) return "Social";
    return "Other";
  }
  