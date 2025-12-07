import { useState } from "react";
import RfpPage from "./RfpPage";
import VendorPage from "./VendorPage";
import ScoresPage from "./ScoresPage";

export default function App() {
  const [page, setPage] = useState<"rfp" | "vendors" | "scores">("rfp");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 16,
          background: "#f3f4f6",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <button onClick={() => setPage("rfp")}>RFP Generator</button>
        <button onClick={() => setPage("vendors")}>Vendors</button>
        <button onClick={() => setPage("scores")}>Scores</button>
      </div>

      {page === "rfp" && <RfpPage />}
      {page === "vendors" && <VendorPage />}
      {page === "scores" && <ScoresPage />}
    </div>
  );
}
