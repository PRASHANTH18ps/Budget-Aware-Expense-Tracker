import React, { useState, useEffect } from "react";
import axios from "axios";
import { API, authHeader } from "../api";

export default function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/expenses/report/${month}`, authHeader());
      setReport(res.data.report || []);
    } catch (err) {
      console.error(err);
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, [month]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 800, width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Monthly Expense Reports</h2>

        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8, backgroundColor: "#f9f9f9", marginBottom: 20 }}>
          <form onSubmit={(e) => { e.preventDefault(); load(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="month" style={{ marginBottom: 4, fontWeight: "bold" }}>Select Month</label>
              <input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ padding: 10, border: "none", borderRadius: 4, cursor: "pointer", fontSize: 16 }}
            >
              {loading ? "Loading..." : "Load Report"}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 20 }}>
          <h3 style={{ textAlign: "center", marginBottom: 12 }}>Expense Reports</h3>
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading report...</p>
          ) : report.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>No data available for the selected month.</p>
          ) : (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
              {report.map((r) => (
                <div key={r.categoryId} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #eee", backgroundColor: "white" }}>
                  <div style={{ width: 20, height: 20, background: r.color, borderRadius: 4, border: "1px solid #ccc" }} />
                  <div style={{ flex: 1, fontWeight: "bold" }}>{r.name}</div>
                  <div style={{ width: 100, textAlign: "right" }}>₹{r.spent.toFixed(2)}</div>
                  <div style={{ width: 100, textAlign: "right" }}>
                    {r.limit === 0 ? "No Budget" : `₹${r.limit.toFixed(2)}`}
                  </div>
                  <div
                    style={{
                      width: 100,
                      textAlign: "right",
                      color: r.remaining < 0 ? "red" : r.remaining === 0 ? "orange" : "green",
                      fontWeight: r.remaining < 0 ? "bold" : "normal"
                    }}
                  >
                    ₹{r.remaining.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
