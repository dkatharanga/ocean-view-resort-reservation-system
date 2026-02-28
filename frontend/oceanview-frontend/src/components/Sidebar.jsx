import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");

  const handleExit = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItem = (path, icon, label) => {
    const isActive = location.pathname === path;
    return (
      <Link to={path} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", borderRadius: 6, textDecoration: "none",
        color:      isActive ? "#fff" : "#adb5bd",
        background: isActive ? "#0d6efd" : "transparent",
        marginBottom: 2, fontSize: 14,
        fontWeight: isActive ? "bold" : "normal",
        transition: "background 0.2s, color 0.2s",
      }}
        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
        onMouseOut={e  => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "#111827",
      display: "flex", flexDirection: "column", padding: "20px 10px",
      position: "fixed", top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "10px 16px 16px", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>🌊 OceanView</div>
        <div style={{ fontSize: 11, color: "#6c757d", marginTop: 2 }}>Resort Management</div>
      </div>

      {/* Main nav */}
      <div style={{ fontSize: 10, color: "#6c757d", padding: "0 16px", margin: "8px 0 6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Main</div>
      {navItem("/dashboard",    "📊", "Dashboard")}
      {navItem("/reservations", "🛎️", "Reservations")}
      {navItem("/reports",      "📈", "Reports")}

      {/* Admin only */}
      {user.role === "ADMIN" && (
        <>
          <div style={{ fontSize: 10, color: "#6c757d", padding: "0 16px", margin: "12px 0 6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Admin</div>
          {navItem("/users", "👥", "User Management")}
        </>
      )}

      {/* Support */}
      <div style={{ fontSize: 10, color: "#6c757d", padding: "0 16px", margin: "12px 0 6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Support</div>
      {navItem("/help", "❓", "Help & Guide")}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User info */}
      <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#adb5bd" }}>Logged in as</div>
        <div style={{ fontSize: 13, color: "#fff", fontWeight: "bold" }}>{user.username || "User"}</div>
        <div style={{ fontSize: 11, color: user.role === "ADMIN" ? "#6ea8fe" : "#75b798", marginTop: 2 }}>
          {user.role === "ADMIN" ? "👑 Admin" : "👤 Staff"}
        </div>
      </div>

      {/* Exit */}
      <button onClick={handleExit} style={{
        width: "100%", padding: "10px 16px", background: "#dc3545", color: "#fff",
        border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14,
        fontWeight: "bold", textAlign: "left", transition: "background 0.2s",
      }}
        onMouseOver={e => e.currentTarget.style.background = "#bb2d3b"}
        onMouseOut={e  => e.currentTarget.style.background = "#dc3545"}
      >
        🚪 Exit
      </button>
    </div>
  );
}