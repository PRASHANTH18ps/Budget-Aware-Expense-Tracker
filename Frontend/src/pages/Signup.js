import React, { useState } from "react";
import axios from "axios";
import { API } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const signup = async () => {
    // client-side validation
    setError("");
    if (!firstName.trim() || !email.trim() || !password) {
      setError('Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/signup`, { firstName, lastName, email, password, confirmPassword });
      // on success, attempt to login immediately so user is authenticated
      if (res.status >= 200 && res.status < 300) {
        try {
          const loginRes = await axios.post(`${API}/auth/login`, { email, password });
          const token = loginRes.data.token;
          auth.login({ token });
          // fetch profile
          try {
            const me = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
            auth.login({ token, user: me.data });
          } catch (e) {
            // ignore profile fetch error
          }
          navigate('/dashboard');
          return;
        } catch (e) {
          // login failed after signup, still notify user
          setError(res.data?.message || 'Signed up, but automatic login failed. Please login.');
          navigate('/');
          return;
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-container">
      <div className="auth-card">
        <h2>Signup</h2>
        <div className="auth-form">
          <label className="auth-label">First name</label>
          <input placeholder="First name" value={firstName} onChange={e=>setFirstName(e.target.value)} />

          <label className="auth-label">Last name</label>
          <input placeholder="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} />

          <label className="auth-label">Email</label>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />

          <label className="auth-label">Password</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            {/* <button type="button" onClick={() => setShowPassword(s => !s)} style={{ padding: '6px 8px' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? 'Hide' : 'Show'}
            </button> */}
          </div>

          <label className="auth-label">Confirm password</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
            {/* <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ padding: '6px 8px' }} aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
              {showConfirm ? 'Hide' : 'Show'}
            </button> */}
          </div>

          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          <button onClick={signup} disabled={loading} style={{ marginTop: 8 }}>{loading ? 'Signing up...' : 'Signup'}</button>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            Already have an account? <Link to="/">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
