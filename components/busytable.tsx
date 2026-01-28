export default function BusyTable({
    weekly,
  }: {
    weekly: { weekStartISO: string; Academic: number; Social: number; Other: number }[];
  }) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                Week starting
              </th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>
                Academic (hrs)
              </th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>
                Social (hrs)
              </th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>
                Other (hrs)
              </th>
            </tr>
          </thead>
          <tbody>
            {weekly.map((w) => (
              <tr key={w.weekStartISO}>
                <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{w.weekStartISO}</td>
                <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>
                  {w.Academic.toFixed(1)}
                </td>
                <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>
                  {w.Social.toFixed(1)}
                </td>
                <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>
                  {w.Other.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  