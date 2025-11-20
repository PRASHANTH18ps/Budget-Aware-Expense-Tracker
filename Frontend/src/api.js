export const API = process.env.REACT_APP_API_URL || "https://budget-aware-expense-tracker-backend.onrender.com/api";

export const authHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
};
