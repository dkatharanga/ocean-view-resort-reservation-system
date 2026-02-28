import { useNavigate } from "react-router-dom";

export default function Navbar({ title }) {
  const navigate = useNavigate();

  // ✅ Get logged in user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h2>{title || "Ocean View Resort"}</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Show logged in user */}
        <span style={{ color: "#555", fontSize: "14px" }}>
          👤 <strong>{user.username || "Guest"}</strong>
          {user.role && (
            <span style={{
              marginLeft: "6px",
              padding: "2px 8px",
              background: user.role === "ADMIN" ? "#0d6efd" : "#198754",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "11px",
            }}>
              {user.role}
            </span>
          )}
        </span>

        {/* Logout button */}
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            background: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}