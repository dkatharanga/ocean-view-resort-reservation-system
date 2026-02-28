import React, { useState } from "react";
import API from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/api/auth/login", form);
      
      // ✅ Save user to localStorage
      localStorage.setItem("user", JSON.stringify(res.data));
      
      toast.success(`Welcome back, ${res.data.username}!`);
      
      // ✅ Redirect based on role
      setTimeout(() => {
        if (res.data.role === "ADMIN") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }, 1000);

    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏨 OceanView Hotel</h2>
        <h3 style={styles.subtitle}>Staff Login</h3>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#0d6efd" }}>Register</a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f5",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: { textAlign: "center", color: "#1a1a2e", marginBottom: "4px" },
  subtitle: { textAlign: "center", color: "#666", marginBottom: "24px", fontWeight: "normal" },
  field: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontWeight: "bold", color: "#333" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "8px",
  },
  link: { textAlign: "center", marginTop: "16px", color: "#666" },
};

export default Login;