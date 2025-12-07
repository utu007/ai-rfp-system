import { useState } from "react";
import axios from "axios";

export default function RfpPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [rfp, setRfp] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setRfp(null);

    try {
      const res = await axios.post("http://localhost:4000/api/rfps/from-text", { text });
      setRfp(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>AI RFP Generator</h1>
      <p>Describe what you want to buy in natural language.</p>

      <textarea
        rows={6}
        placeholder="I need 50 routers, 10 switches, budget 1 lakh..."
        style={{ width: "100%", padding: 10 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !text.trim()}
        style={{ padding: "10px 20px", marginTop: 10, cursor: "pointer" }}
      >
        {loading ? "Generating..." : "Generate RFP"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}

      {rfp && (
        <div style={{ marginTop: 20, padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
          <h2>Structured RFP</h2>
          <p><strong>Title:</strong> {rfp.title}</p>
          <p><strong>Description:</strong> {rfp.description}</p>
          <p><strong>Budget:</strong> {rfp.budget ?? "N/A"}</p>
          <p><strong>Delivery Days:</strong> {rfp.deliveryDays ?? "N/A"}</p>
          <p><strong>Payment Terms:</strong> {rfp.paymentTerms ?? "N/A"}</p>
          <p><strong>Warranty:</strong> {rfp.warranty ?? "N/A"}</p>

          <h3>Items</h3>
          <ul>
            {rfp.items?.map((i: any) => (
              <li key={i.id}>
                {i.name} — Qty: {i.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
