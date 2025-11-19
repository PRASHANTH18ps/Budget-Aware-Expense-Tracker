import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API, authHeader } from "../api";

export default function AddExpense({ onSaved }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/categories`, authHeader()).then(r => {
      setCategories(r.data);
      if (r.data.length) setCategoryId(r.data[0]._id);
    }).catch(()=>{});
  }, []);

  const save = async () => {
    if (!categoryId || !amount) return alert("Choose category and amount");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/expenses`, { categoryId, amount: Number(amount), date }, authHeader());
      const data = res.data;
      if (data.withinBudget) {
        alert("saved");
      } else {
        alert("saved");
      }
      setAmount("");
      if (onSaved) onSaved();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, width: 360 }}>
      <h4>Add Expense</h4>
      <div>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="" disabled>Category Name</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ marginTop:8 }}>
        <input placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>

      <div style={{ marginTop:8 }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div style={{ marginTop:8 }}>
        <button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Expense"}</button>
      </div>
    </div>
  );
}
