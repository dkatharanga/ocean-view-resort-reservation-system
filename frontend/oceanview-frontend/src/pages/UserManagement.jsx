import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Validation ────────────────────────────────────────────────────────────────
function validateUser(form, isEdit) {
  const errors = {};
  if (!form.username || form.username.trim().length < 3)
    errors.username = "Username must be at least 3 characters";
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Valid email address required";
  if (!isEdit && (!form.password || form.password.length < 4))
    errors.password = "Password must be at least 4 characters";
  if (!form.role)
    errors.role = "Role is required";
  return errors;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function UserManagement() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ username: "", email: "", password: "", role: "USER" });
  const [errors, setErrors]     = useState({});
  const [editId, setEditId]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");
  const [currentUser]           = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));

  useEffect(() => {
    if (!currentUser?.id) {
      window.location.href = "/login";
      return;
    }
    if (currentUser.role !== "ADMIN") {
      toast.error("Admin access required");
      window.location.href = "/dashboard";
      return;
    }
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await API.get("/api/auth/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateUser(form, !!editId);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      if (editId) {
        await API.put("/api/auth/users/" + editId, form);
        toast.success("User updated successfully");
      } else {
        await API.post("/api/auth/register", form);
        toast.success("User created successfully");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  }

  function handleEdit(user) {
    setEditId(user.id);
    setForm({ username: user.username, email: user.email, password: "", role: user.role });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id, username) {
    if (id === currentUser.id) { toast.error("Cannot delete your own account"); return; }
    if (!window.confirm('Delete user "' + username + '"? This cannot be undone.')) return;
    try {
      await API.delete("/api/auth/users/" + id);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  }

  function resetForm() {
    setForm({ username: "", email: "", password: "", role: "USER" });
    setErrors({});
    setEditId(null);
    setShowForm(false);
  }

  const filteredUsers = users.filter((u) =>
    (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email    || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.role     || "").toLowerCase().includes(search.toLowerCase())
  );

  function inputStyle(field) {
    return {
      padding: "10px 12px", width: "100%", boxSizing: "border-box", fontSize: 14,
      border: "1px solid " + (errors[field] ? "#dc3545" : "#ddd"),
      borderRadius: 6, outline: "none",
      background: errors[field] ? "#fff5f5" : "#fff",
    };
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="User Management" />

        <div style={{ padding: 24 }}>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total Users", value: users.length,                                  icon: "👥", color: "#0d6efd", bg: "#e7f0ff" },
              { label: "Admins",      value: users.filter((u) => u.role === "ADMIN").length, icon: "👑", color: "#6f42c1", bg: "#f3e8ff" },
              { label: "Staff",       value: users.filter((u) => u.role === "USER").length,  icon: "👤", color: "#198754", bg: "#e8f5e9" },
            ].map((c) => (
              <div key={c.label} style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: "4px solid " + c.color }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888", textTransform: "uppercase" }}>{c.label}</p>
                    <p style={{ margin: 0, fontSize: 28, fontWeight: "bold", color: c.color }}>{c.value}</p>
                  </div>
                  <div style={{ width: 44, height: 44, background: c.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {c.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Form */}
          {showForm && (
            <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e0e7ff" }}>
              <h3 style={{ margin: "0 0 20px", color: "#111827", borderBottom: "1px solid #f0f0f0", paddingBottom: 12 }}>
                {editId ? "✏️ Edit User" : "➕ Add New User"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#555" }}>Username *</label>
                    <input name="username" value={form.username} onChange={handleChange} placeholder="Min 3 characters" style={inputStyle("username")} />
                    {errors.username && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#dc3545" }}>{errors.username}</p>}
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#555" }}>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="user@email.com" style={inputStyle("email")} />
                    {errors.email && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#dc3545" }}>{errors.email}</p>}
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#555" }}>
                      {editId ? "Password (leave blank to keep)" : "Password *"}
                    </label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={editId ? "Leave blank to keep" : "Min 4 characters"} style={inputStyle("password")} />
                    {errors.password && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#dc3545" }}>{errors.password}</p>}
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#555" }}>Role *</label>
                    <select name="role" value={form.role} onChange={handleChange} style={inputStyle("role")}>
                      <option value="USER">Staff (USER)</option>
                      <option value="ADMIN">Administrator (ADMIN)</option>
                    </select>
                    {errors.role && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#dc3545" }}>{errors.role}</p>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="submit" style={{ padding: "10px 28px", background: editId ? "#0d6efd" : "#198754", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 14 }}>
                    {editId ? "✏️ Update User" : "➕ Create User"}
                  </button>
                  <button type="button" onClick={resetForm} style={{ padding: "10px 28px", background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* User Table */}
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#111827" }}>👥 System Users</h3>
              <div style={{ display: "flex", gap: 12 }}>
                <input
                  placeholder="🔍 Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, width: 220, outline: "none" }}
                />
                {!showForm && (
                  <button onClick={() => setShowForm(true)} style={{ padding: "8px 20px", background: "#198754", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", fontSize: 14 }}>
                    ➕ Add User
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <p style={{ textAlign: "center", padding: 40, color: "#888" }}>⏳ Loading...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    {["#", "Username", "Email", "Role", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px", textAlign: "left", fontSize: 13, color: "#444", borderBottom: "2px solid #dee2e6", fontWeight: "bold" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: 30, color: "#888" }}>No users found</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#f8f9ff")}
                        onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "11px 12px", fontSize: 14, color: "#888" }}>{i + 1}</td>
                        <td style={{ padding: "11px 12px", fontSize: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: u.role === "ADMIN" ? "#e7f0ff" : "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                              {u.role === "ADMIN" ? "👑" : "👤"}
                            </div>
                            <div>
                              <div style={{ fontWeight: "bold", color: "#111827" }}>{u.username}</div>
                              {u.id === currentUser.id && <div style={{ fontSize: 11, color: "#0d6efd" }}>You</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "11px 12px", fontSize: 14, color: "#555" }}>{u.email}</td>
                        <td style={{ padding: "11px 12px" }}>
                          <span style={{
                            padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: "bold",
                            background: u.role === "ADMIN" ? "#e7f0ff" : "#e8f5e9",
                            color:      u.role === "ADMIN" ? "#0d6efd"  : "#198754",
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                          <button onClick={() => handleEdit(u)} style={{ marginRight: 6, padding: "5px 12px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            disabled={u.id === currentUser.id}
                            style={{ padding: "5px 12px", background: u.id === currentUser.id ? "#ccc" : "#dc3545", color: "#fff", border: "none", borderRadius: 4, cursor: u.id === currentUser.id ? "not-allowed" : "pointer", fontSize: 12 }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default UserManagement;