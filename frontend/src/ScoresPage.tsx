import { useEffect, useState } from "react";
import axios from "axios";

interface Rfp {
  id: number;
  title: string;
}

interface ScoreRow {
  vendor: string;
  vendorEmail: string;
  price: number | null;
  deliveryDays: number | null;
  warranty: string | null;
  priceScore: number;
  deliveryScore: number;
  warrantyScore: number;
  totalScore: number;
}

export default function ScoresPage() {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [selectedRfpId, setSelectedRfpId] = useState<number | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRfps();
  }, []);

  async function loadRfps() {
    try {
      const res = await axios.get<Rfp[]>("http://localhost:4000/api/rfps");
      setRfps(res.data);
      if (res.data.length > 0 && selectedRfpId === null) {
        setSelectedRfpId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load RFPs");
    }
  }

  async function loadScores() {
    if (!selectedRfpId) return;
    setLoading(true);
    setError("");
    setScores([]);

    try {
      const res = await axios.get<ScoreRow[]>(
        `http://localhost:4000/api/rfps/${selectedRfpId}/score`
      );
      setScores(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load scores");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Proposal Scoring</h1>
      <p>Select an RFP and see ranked vendor proposals.</p>

      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <select
          style={{ padding: 8, minWidth: 250 }}
          value={selectedRfpId ?? ""}
          onChange={(e) => setSelectedRfpId(Number(e.target.value))}
        >
          <option value="">Select an RFP</option>
          {rfps.map((r) => (
            <option key={r.id} value={r.id}>
              #{r.id} — {r.title}
            </option>
          ))}
        </select>

        <button
          onClick={loadScores}
          disabled={!selectedRfpId || loading}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          {loading ? "Scoring..." : "Load Scores"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {scores.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              <th style={th}>Vendor</th>
              <th style={th}>Price</th>
              <th style={th}>Delivery (days)</th>
              <th style={th}>Warranty</th>
              <th style={th}>Price Score</th>
              <th style={th}>Delivery Score</th>
              <th style={th}>Warranty Score</th>
              <th style={th}>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((row, i) => (
              <tr key={row.vendorEmail}>
                <td style={td}>
                  <strong>{row.vendor}</strong>
                  <br />
                  <span style={{ color: "#555" }}>{row.vendorEmail}</span>
                  {i === 0 && (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "2px 6px",
                        background: "#d1fae5",
                        borderRadius: 4,
                        fontSize: 11,
                      }}
                    >
                      Best Match
                    </span>
                  )}
                </td>
                <td style={td}>{row.price ?? "N/A"}</td>
                <td style={td}>{row.deliveryDays ?? "N/A"}</td>
                <td style={td}>{row.warranty ?? "N/A"}</td>
                <td style={td}>{row.priceScore}</td>
                <td style={td}>{row.deliveryScore}</td>
                <td style={td}>{row.warrantyScore}</td>
                <td style={{ ...td, fontWeight: "bold" }}>{row.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && scores.length === 0 && selectedRfpId && (
        <p style={{ marginTop: 20 }}>
          No scored responses yet. Make sure you’ve recorded vendor replies for
          this RFP.
        </p>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  padding: "8px 6px",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px 6px",
};
