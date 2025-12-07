import { useState, useEffect } from "react";
import axios from "axios";

export default function VendorPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadVendors() {
    const res = await axios.get("http://localhost:4000/api/vendors");
    setVendors(res.data);
  }

  async function addVendor() {
    if (!name.trim() || !email.trim()) return alert("Enter name & email");

    setLoading(true);

    try {
      await axios.post("http://localhost:4000/api/vendors", {
        name,
        email,
      });

      setName("");
      setEmail("");
      loadVendors();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create vendor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Vendor Management</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Vendor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, width: "45%", marginRight: 10 }}
        />
        <input
          placeholder="Vendor Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, width: "45%" }}
        />
        <button
          style={{ display: "block", marginTop: 10, padding: "10px 16px" }}
          onClick={addVendor}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Vendor"}
        </button>
      </div>

      <h2>All Vendors</h2>
      <ul>
        {vendors.map((v) => (
          <li key={v.id}>
            <strong>{v.name}</strong> — {v.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
