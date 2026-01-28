import { startOfWeek } from "date-fns";
import { categorize, Category } from "./categorize";

export type EventRow = {
  summary: string;
  startISO: string;
  endISO: string;
  hours: number;
  category: Category;
  weekStartISO: string;
};

export type WeeklyTotals = {
  weekStartISO: string;
  Academic: number;
  Social: number;
  Other: number;
};

export function toHours(startISO: string, endISO: string) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  return Math.max(0, (end - start) / (1000 * 60 * 60));
}

export function normalizeGoogleEvent(ev: any): { startISO: string; endISO: string } | null {
  const start = ev?.start?.dateTime ?? ev?.start?.date;
  const end = ev?.end?.dateTime ?? ev?.end?.date;
  if (!start || !end) return null;

  // All-day events come as YYYY-MM-DD; treat as midnight UTC-ish in JS Date parsing.
  const startISO = start.includes("T") ? start : `${start}T00:00:00`;
  const endISO = end.includes("T") ? end : `${end}T00:00:00`;
  return { startISO, endISO };
}

export function aggregateWeekly(events: any[]): { rows: EventRow[]; weekly: WeeklyTotals[] } {
  const rows: EventRow[] = [];

  for (const ev of events) {
    const summary = ev?.summary ?? "(no title)";
    const norm = normalizeGoogleEvent(ev);
    if (!norm) continue;

    const hours = toHours(norm.startISO, norm.endISO);
    if (hours <= 0) continue;

    const category = categorize(summary);

    const weekStart = startOfWeek(new Date(norm.startISO), { weekStartsOn: 1 }); // Monday
    const weekStartISO = weekStart.toISOString().slice(0, 10);

    rows.push({
      summary,
      startISO: norm.startISO,
      endISO: norm.endISO,
      hours,
      category,
      weekStartISO,
    });
  }

  const map = new Map<string, WeeklyTotals>();

  for (const r of rows) {
    if (!map.has(r.weekStartISO)) {
      map.set(r.weekStartISO, {
        weekStartISO: r.weekStartISO,
        Academic: 0,
        Social: 0,
        Other: 0,
      });
    }
    const wk = map.get(r.weekStartISO)!;
    wk[r.category] += r.hours;
  }

  const weekly = Array.from(map.values()).sort((a, b) =>
    a.weekStartISO.localeCompare(b.weekStartISO)
  );

  // Ensure 4 weeks appear even if zero events (optional; simple version skips)
  return { rows, weekly };
}
