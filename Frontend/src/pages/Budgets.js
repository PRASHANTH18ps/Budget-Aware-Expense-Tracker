import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeader } from "../api";

export default function Budgets() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({}); // catId -> limit
  const [saveStatus, setSaveStatus] = useState({}); // catId -> "saved" or ""

  const load = async () => {
    try {
      const [catRes, budRes] = await Promise.all([
        axios.get(`${API}/categories`, authHeader()),
        axios.get(`${API}/budgets/${month}`, authHeader())
      ]);
      setCategories(catRes.data);
      const map = {};
      (budRes.data || []).forEach(b => { if (b.categoryId) map[b.categoryId._id] = b.limit; });
      setBudgets(map);
    } catch (err) { console.error(err); }
  };

  useEffect(()=>{ load(); }, [month]);

  const saveBudget = async (categoryId, limit) => {
    try {
      await axios.post(`${API}/budgets`, { categoryId, month, limit: Number(limit) }, authHeader());
      setSaveStatus(prev => ({ ...prev, [categoryId]: "saved" }));
      load();
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [categoryId]: "" }));
      }, 2000);
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Budgets</h2>

        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8, backgroundColor: "#f9f9f9", marginBottom: 20 }}>
          <form style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="month" style={{ marginBottom: 4, fontWeight: "bold" }}>Select Month</label>
              <input
                id="month"
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>
          </form>
        </div>

        <div style={{ marginTop: 20 }}>
          <h3 style={{ textAlign: "center", marginBottom: 12 }}>Category Budgets</h3>
          {categories.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>No categories available. Add categories first!</p>
          ) : (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
              {categories.map(c => (
                <div key={c._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #eee", backgroundColor: "white" }}>
                  <div style={{ width: 20, height: 20, background: c.color, borderRadius: 4, border: "1px solid #ccc" }} />
                  <div style={{ flex: 1, fontWeight: "bold" }}>{c.name}</div>
                  <input
                    type="number"
                    value={budgets[c._id] || ""}
                    onChange={e => setBudgets(prev => ({ ...prev, [c._id]: e.target.value }))}
                    placeholder="Enter budget"
                    style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4, width: 100 }}
                  />
                  <button
                    onClick={() => saveBudget(c._id, budgets[c._id] || 0)}
                    style={{ padding: 6, border: "none", borderRadius: 4, cursor: "pointer", width: 60 }}
                  >
                    Save
                  </button>
                  {saveStatus[c._id] && <span style={{ color: "green", marginLeft: 8 }}>{saveStatus[c._id]}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
