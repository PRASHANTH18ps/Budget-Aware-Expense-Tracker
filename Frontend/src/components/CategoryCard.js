import React from "react";

export default function CategoryCard({ category, spent = 0, limit = 0 }) {
  const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const over = limit > 0 && spent > limit;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, width: 260, margin: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: category.color || "#3498db" }} />
        <strong>{category.name}</strong>
        {over && <span style={{ marginLeft: 8, color: "white", background: "red", padding: "2px 6px", borderRadius: 4 }}>OVER BUDGET</span>}
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ height: 10, background: "#eee", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: over ? "red" : "#2ecc71" }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 14 }}>
          Spent: ₹{spent} / Limit: ₹{limit} • Remaining: ₹{limit - spent}
        </div>
      </div>
    </div>
  );
}
