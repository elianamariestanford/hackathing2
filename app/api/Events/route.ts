import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";
import { addWeeks } from "date-fns";
import { aggregateWeekly } from "../../../lib/aggregate";

export const runtime = "nodejs";

type Category = "Academic" | "Social" | "Other";

type EventItem = {
  id: string;
  title: string;
  startISO: string;
  hours: number;
  category: Category;
};

type Weekly = {
  weekStartISO: string;
  Academic: number;
  Social: number;
  Other: number;
};

type WeeklyDetails = Record<string, Record<Category, EventItem[]>>;

function parseEventDate(e: any, key: "start" | "end") {
  const raw = e[key]?.dateTime ?? e[key]?.date; // all-day uses date
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function durationHours(start: Date, end: Date) {
  return Math.max(0, (end.getTime() - start.getTime()) / 36e5);
}

/**
 * IMPORTANT:
 * Ideally match aggregateWeekly's categorization logic.
 */
function categorize(title: string): Category {
  const t = (title || "").toLowerCase();

  const academic = [
    "class",
    "lecture",
    "lab",
    "office hour",
    "study",
    "review",
    "exam",
    "quiz",
    "hw",
    "homework",
    "research",
    "meeting",
  ];

  const social = [
    "dinner",
    "lunch",
    "brunch",
    "party",
    "hang",
    "date",
    "coffee",
    "drinks",
    "birthday",
    "social",
  ];

  if (academic.some((k) => t.includes(k))) return "Academic";
  if (social.some((k) => t.includes(k))) return "Social";
  return "Other";
}
function findWeekBucket(startISO: string, weekly: Weekly[]) {
  if (!weekly.length) return null;
  const t = new Date(startISO).getTime();

  let best = weekly[0].weekStartISO;
  let bestDist = Infinity;

  for (const w of weekly) {
    const dist = Math.abs(new Date(w.weekStartISO).getTime() - t);
    if (dist < bestDist) {
      bestDist = dist;
      best = w.weekStartISO;
    }
  }

  return best;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (!accessToken) {
    console.error("No accessToken on session:", session);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth });

    const timeMin = new Date().toISOString();
    const timeMax = addWeeks(new Date(), 4).toISOString();

    const resp = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500,
    });

    const items = resp.data.items ?? [];

    const { weekly } = aggregateWeekly(items);

    const weeklyDetails: WeeklyDetails = {};
    for (const w of weekly) {
      weeklyDetails[w.weekStartISO] = { Academic: [], Social: [], Other: [] };
    }

    for (const e of items) {
      const start = parseEventDate(e, "start");
      const end = parseEventDate(e, "end");
      if (!start || !end) continue;

      const hours = durationHours(start, end);
      if (hours <= 0) continue;

      const category = categorize(e.summary ?? "");

      const bucket = findWeekBucket(start.toISOString(), weekly);
      if (!bucket) continue;

      weeklyDetails[bucket][category].push({
        id: e.id ?? `${bucket}-${e.summary ?? "event"}`,
        title: e.summary ?? "(No title)",
        startISO: start.toISOString(),
        hours,
        category,
      });
    }

    return NextResponse.json({ weekly, weeklyDetails });
  } catch (err: any) {
    console.error("Google Calendar API error:", err?.response?.data || err);

    return NextResponse.json(
      {
        error: "Google Calendar fetch failed",
        details: err?.response?.data || String(err),
      },
      { status: 500 }
    );
  }
}
