"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import BusyChart from "../components/busychart";
import BusyTable from "../components/busytable";

type Weekly = {
  weekStartISO: string;
  Academic: number;
  Social: number;
  Other: number;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const [weekly, setWeekly] = useState<Weekly[]>([]);
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
          Your next 4 weeks, categorized into{" "}
          <b>Academic</b>, <b>Social</b>, and <b>Other</b>.
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
          <button
            onClick={() => signIn("google")}
            style={primaryButton}
          >
            Sign in with Google
          </button>
        ) : (
          <>
            <div style={{ color: "#444", fontSize: 14 }}>
              Signed in as <b>{session?.user?.email}</b>
            </div>
            <button
              onClick={() => signOut()}
              style={secondaryButton}
            >
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
        </div>
      )}

      {status === "authenticated" && !error && weekly.length === 0 && (
        <Card>
          <p style={{ color: "#666" }}>
            No events found in the next 4 weeks.
          </p>
        </Card>
      )}
    </main>
  );
}

/* --- Reusable styles --- */

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
