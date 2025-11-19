import React, { useEffect, useState } from "react";
import axios from "axios";
import { API, authHeader } from "../api";
import CategoryCard from "../components/CategoryCard";
import AddExpense from "../components/AddExpense";

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [spentMap, setSpentMap] = useState({});
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7)); // "YYYY-MM"
  const [showAddExpense, setShowAddExpense] = useState(false);

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

  return (
    <div className="centered-container">
      <div className="dashboard-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>Dashboard</h2>
            <div className="month-display" style={{ marginTop: 6 }}>
              {(() => {
                try {
                  const d = new Date(month + '-01');
                  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
                } catch (e) {
                  return month;
                }
              })()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 14 }}>Month</label>
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 860 }}>
            {categories.map(c => (
              <CategoryCard key={c._id} category={c} spent={spentMap[c._id] || 0} limit={budgets[c._id] || 0} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setShowAddExpense(true)} style={{ padding: '10px 20px', fontSize: 16, borderRadius: 8 }}>Add Expense</button>
        </div>

        {showAddExpense && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
            <div>
              <AddExpense onSaved={() => { load(); setShowAddExpense(false); }} />
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button onClick={() => setShowAddExpense(false)} style={{ padding: '6px 10px' }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
