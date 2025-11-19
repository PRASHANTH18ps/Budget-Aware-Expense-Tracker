import React, { useState } from "react";
import axios from "axios";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    // client-side validation
    setError("");
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      const token = res.data.token;
      // set token in context
      auth.login({ token });

      // try to fetch profile
      try {
        const me = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
        auth.login({ token, user: me.data });
      } catch (e) {
        // ignore profile fetch error
      }

      navigate("/dashboard");
    } catch (err) {
      const resp = err.response;
      const serverMsg = resp?.data?.message;

      // If we got a response from server and it indicates invalid credentials
      if (resp) {
        const looksLikeInvalid = (serverMsg && /invalid\s+credentials?|invalid|credentials?/i.test(serverMsg)) || resp.status === 400;
        if (looksLikeInvalid) {
          setError('Password was wrong');
        } else if (serverMsg) {
          setError(serverMsg);
        } else {
          setError(`Login failed (status ${resp.status})`);
        }
      } else {
        // No response -> network error
        setError('Network error: could not reach server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-container">
      <div className="auth-card">
        <h2>Login</h2>
        <div className="auth-form">
          <label className="auth-label">Email</label>
          <input placeholder="Email" value={email} onChange={e=>{ setEmail(e.target.value); setError(''); }} />

          <label className="auth-label">Password</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e=>{ setPassword(e.target.value); setError(''); }} />
            {/* <button type="button" onClick={() => setShowPassword(s => !s)} style={{ padding: '6px 8px' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? 'Hide' : 'Show'}
            </button> */}
          </div>
          {error && <div style={{ color: 'red', marginTop: 6 }}>{error}</div>}

          <button onClick={login} disabled={loading} style={{ marginTop: 8 }}>{loading ? 'Logging in...' : 'Login'}</button>
          <div style={{ marginTop:8, textAlign: 'center' }}>Create a new Account? <a href="/signup">Signup</a></div>
        </div>
      </div>
    </div>
  );
}
