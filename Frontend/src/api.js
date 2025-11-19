export const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const authHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
};
