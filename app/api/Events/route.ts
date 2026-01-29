import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";
import { addWeeks } from "date-fns";
import { aggregateWeekly } from "../../../lib/aggregate";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (!accessToken) {
    // helpful debug
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

    return NextResponse.json({ weekly });
  } catch (err: any) {
    // This will usually contain the real Google error (401/403 + message)
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
