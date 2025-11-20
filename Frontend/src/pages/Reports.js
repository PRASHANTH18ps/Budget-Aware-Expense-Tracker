import React, { useState, useEffect } from "react";
import axios from "axios";
import { API, authHeader } from "../api";

export default function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [spentMap, setSpentMap] = useState({});
  const [view, setView] = useState('table');

  const load = async () => {
    try {
      const [catRes, budRes, expRes] = await Promise.all([
        axios.get(`${API}/categories`, authHeader()),
        axios.get(`${API}/budgets/${month}`, authHeader()).catch(()=>({data:[] })),
        axios.get(`${API}/expenses`, authHeader()).catch(()=>({data:[] }))
      ]);
      setCategories(catRes.data);

      // budgets (map by category)
      const budMap = {};
      (budRes.data || []).forEach(b => { if (b.categoryId) budMap[b.categoryId._id] = b.limit; });
      setBudgets(budMap);

      // compute spent in selected month
      const map = {};
      (expRes.data || []).forEach(e => {
        const eMonth = new Date(e.date).toISOString().slice(0,7);
        if (eMonth === month) {
          map[e.categoryId._id] = (map[e.categoryId._id] || 0) + e.amount;
        }
      });
      setSpentMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=>{ load(); }, [month]);

  // Compute report from loaded data
  const report = categories.map(c => {
    const spent = spentMap[c._id] || 0;
    const limit = budgets[c._id] || 0;
    const remaining = limit - spent;
    return {
      categoryId: c._id,
      name: c.name,
      color: c.color,
      spent,
      limit,
      remaining
    };
  });

  return (
    <div className="centered-container">
      <div className="dashboard-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>Reports</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 14 }}>Month</label>
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setView('table')} style={{ marginRight: 10, backgroundColor: view === 'table' ? '#060101ff' : 'white' }}>Table View</button>
        </div>

        {view === 'table' ? (
          <table style={{ width:"100%", marginTop:12, borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ textAlign:"left", borderBottom: "1px solid #ddd" }}>
                <th>Category</th><th>Spent</th><th>Budget</th><th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {report.map(r => (
                <tr key={r.categoryId} style={{ borderBottom:"1px solid #f0f0f0" }}>
                  <td>{r.name}</td>
                  <td>₹{r.spent}</td>
                  <td>₹{r.limit}</td>
                  <td style={{ color: r.remaining < 0 ? "red" : "inherit" }}>₹{r.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={report}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="spent" fill="#8884d8" name="Spent" />
              <Bar dataKey="limit" fill="#82ca9d" name="Budget" />
              <Bar dataKey="remaining" fill={report.some(r => r.remaining < 0) ? "#ff0000" : "#ffc658"} name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
