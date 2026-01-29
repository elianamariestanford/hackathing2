"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import BusyChart from "../components/busychart";
import BusyTable from "../components/busytable";

type Weekly = {
  weekStartISO: string;
  Academic: number;
  Social: number;
  Other: number;
};

type EventItem = {
  id: string;
  title: string;
  startISO: string;
  hours: number;
};

type WeeklyDetails = Record<
  string,
  { Academic: EventItem[]; Social: EventItem[]; Other: EventItem[] }
>;

function formatWeekLabel(weekStartISO: string) {
  return format(new Date(weekStartISO), "MMM d"); // "Jan 28"
}

function formatEventTime(startISO: string) {
  return format(new Date(startISO), "MMM d, h:mma"); // "Jan 28, 3:30PM"
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [weekly, setWeekly] = useState<Weekly[]>([]);
  const [weeklyDetails, setWeeklyDetails] = useState<WeeklyDetails>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      setError(null);
      const res = await fetch("/api/events");
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Failed to load events");
        return;
      }
      const data = await res.json();
      setWeekly(data.weekly ?? []);
      setWeeklyDetails(data.weeklyDetails ?? {});
    })();
  }, [status]);

  return (
    <main
      style={{
        maxWidth: 920,
        margin: "60px auto",
        padding: "0 16px",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 34, fontWeight: 600, marginBottom: 6 }}>
          Busy-ness Report
        </h1>
        <p style={{ color: "#666", fontSize: 15 }}>
          Your next 4 weeks, categorized into <b>Academic</b>, <b>Social</b>, and{" "}
          <b>Other</b>.
        </p>
      </header>

      {/* Auth card */}
      <section
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 20,
          marginBottom: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {status !== "authenticated" ? (
          <button onClick={() => signIn("google")} style={primaryButton}>
            Sign in with Google
          </button>
        ) : (
          <>
            <div style={{ color: "#444", fontSize: 14 }}>
              Signed in as <b>{session?.user?.email}</b>
            </div>
            <button onClick={() => signOut()} style={secondaryButton}>
              Sign out
            </button>
          </>
        )}
      </section>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#fff0f0",
            color: "#a40000",
            padding: 16,
            borderRadius: 14,
            marginBottom: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {error}
        </div>
      )}

      {/* Content */}
      {status === "authenticated" && weekly.length > 0 && (
        <div style={{ display: "grid", gap: 24 }}>
          <Card>
            <BusyChart weekly={weekly} />
          </Card>

          <Card>
            <BusyTable weekly={weekly} />
          </Card>

          {/* NEW: Event lists by category per week */}
          <Card>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              What counted (by week)
            </h2>
            <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
              Expand a week to see which events were categorized as Academic /
              Social / Other.
            </p>

            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              {weekly.map((w) => {
                const details = weeklyDetails[w.weekStartISO];
                return (
                  <details
                    key={w.weekStartISO}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 14,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                      Week of {formatWeekLabel(w.weekStartISO)}
                      <span style={{ color: "#777", fontWeight: 500 }}>
                        {" "}
                        — Academic {w.Academic.toFixed(1)}h · Social{" "}
                        {w.Social.toFixed(1)}h · Other {w.Other.toFixed(1)}h
                      </span>
                    </summary>

                    {!details ? (
                      <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
                        No event details returned for this week.
                      </div>
                    ) : (
                      <div style={{ marginTop: 10 }}>
                        <EventGroup title="Academic" events={details.Academic} />
                        <EventGroup title="Social" events={details.Social} />
                        <EventGroup title="Other" events={details.Other} />
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {status === "authenticated" && !error && weekly.length === 0 && (
        <Card>
          <p style={{ color: "#666" }}>No events found in the next 4 weeks.</p>
        </Card>
      )}
    </main>
  );
}

function EventGroup({ title, events }: { title: string; events: EventItem[] }) {
  if (!events || events.length === 0) return null;

  const sorted = [...events].sort(
    (a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()
  );

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {sorted.map((e) => (
          <li key={e.id} style={{ marginBottom: 4, color: "#444" }}>
            {formatEventTime(e.startISO)} — {e.title}{" "}
            <span style={{ color: "#888" }}>({e.hours.toFixed(1)}h)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  background: "#111",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  background: "#f2f2f2",
  color: "#111",
  border: "none",
  padding: "10px 16px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}
