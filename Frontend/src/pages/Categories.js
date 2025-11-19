import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeader } from "../api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3498db");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/categories`, authHeader());
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(()=>{ load(); }, []);

  const save = async () => {
    try {
      if (!name) return alert("Enter name");
      if (editing) {
        await axios.put(`${API}/categories/${editing}`, { name, color }, authHeader());
      } else {
        await axios.post(`${API}/categories`, { name, color }, authHeader());
      }
      setName(""); setColor("#3498db"); setEditing(null);
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const edit = (c) => { setEditing(c._id); setName(c.name); setColor(c.color); };

  const remove = async (id) => {
    if (!window.confirm("Delete category?")) return;
    await axios.delete(`${API}/categories/${id}`, authHeader());
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Categories</h2>

        <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8, backgroundColor: "#f9f9f9" }}>
          <form onSubmit={(e) => { e.preventDefault(); save(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="name" style={{ marginBottom: 4, fontWeight: "bold" }}>Category Name</label>
              <input
                id="name"
                placeholder="Enter category name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="color" style={{ marginBottom: 4, fontWeight: "bold" }}>Color</label>
              <input
                id="color"
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ padding: 4, border: "1px solid #ccc", borderRadius: 4, width: "100%", height: 40 }}
              />
            </div>

            <button
              type="submit"
              style={{ padding: 10, border: "none", borderRadius: 4, cursor: "pointer", fontSize: 16 }}
            >
              {editing ? "Update Category" : "Add Category"}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 20 }}>
          <h3 style={{ textAlign: "center", marginBottom: 12 }}>Existing Categories</h3>
          {categories.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>No categories yet. Add one above!</p>
          ) : (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
              {categories.map(c => (
                <div key={c._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #eee", backgroundColor: "white" }}>
                  <div style={{ width: 20, height: 20, background: c.color, borderRadius: 4, border: "1px solid #ccc" }} />
                  <div style={{ flex: 1, fontWeight: "bold" }}>{c.name}</div>
                  <button
                    onClick={() => edit(c)}
                    style={{ padding: 6, border: "none", borderRadius: 4, cursor: "pointer", width: 60 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c._id)}
                    style={{ padding: 6, border: "none", borderRadius: 4, cursor: "pointer", width: 60 }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
