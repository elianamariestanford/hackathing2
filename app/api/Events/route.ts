import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { addWeeks } from "date-fns";
import { aggregateWeekly } from "@/lib/aggregate";

export async function GET() {
  const session = await getServerSession();
  // @ts-ignore
  const accessToken = session?.accessToken as string | undefined;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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
}
