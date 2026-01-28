"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import BusyChart from "../components/busychart";
import BusyTable from "../components/busytable";

type Weekly = { weekStartISO: string; Academic: number; Social: number; Other: number };

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
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Busy-ness Report (Next 4 Weeks)</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Categorizes calendar events into Academic / Social / Other using simple keywords.
      </p>

      {status !== "authenticated" ? (
        <button onClick={() => signIn("google")} style={{ padding: "10px 14px" }}>
          Sign in with Google
        </button>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: "#333" }}>
            Signed in as <b>{session?.user?.email}</b>
          </div>
          <button onClick={() => signOut()} style={{ padding: "8px 12px" }}>
            Sign out
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: "#fee", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {status === "authenticated" && weekly.length > 0 && (
        <>
          <BusyChart weekly={weekly} />
          <div style={{ height: 12 }} />
          <BusyTable weekly={weekly} />
        </>
      )}

      {status === "authenticated" && !error && weekly.length === 0 && (
        <p>No events found (or all were 0-duration) in the next 4 weeks.</p>
      )}
    </main>
  );
}
