import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data, title, color }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <h4 style={{ margin: "0 0 16px", color: "#111827", fontSize: 15 }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#888" }}>{d.value}</span>
            <div style={{
              width: "100%",
              background: color || "#0d6efd",
              borderRadius: "4px 4px 0 0",
              height: Math.max((d.value / max) * 110, 4) + "px",
              transition: "height 0.4s ease",
            }} />
            <span style={{ fontSize: 10, color: "#666", textAlign: "center" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pie Chart ─────────────────────────────────────────────────────────────────
function PieChart({ data, title }) {
  const COLORS = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1", "#0dcaf0"];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;

  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = 80 + 70 * Math.cos(startAngle);
    const y1 = 80 + 70 * Math.sin(startAngle);
    const x2 = 80 + 70 * Math.cos(endAngle);
    const y2 = 80 + 70 * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return {
      label: d.label,
      value: d.value,
      color: COLORS[i % COLORS.length],
      path: `M 80 80 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <h4 style={{ margin: "0 0 16px", color: "#111827", fontSize: 15 }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="2" />
          ))}
        </svg>
        <div>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#444" }}>{s.label}: <strong>{s.value}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon, color, bg, sub }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: "4px solid " + color }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: "bold", color: color }}>{value}</p>
          {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>{sub}</p>}
        </div>
        <div style={{ width: 42, height: 42, background: bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Reports Page ──────────────────────────────────────────────────────────────
function Reports() {
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRoom, setFilterRoom] = useState("All");
  const [dateError, setDateError] = useState("");
  const printRef = useRef();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "/login";
      return;
    }
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await API.get("/api/reservations");
      const data = Array.isArray(res.data) ? res.data : [];
      setReservations(data);
      setFiltered(data);
    } catch (err) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    setDateError("");
    if (dateFrom && dateTo && dateTo < dateFrom) {
      setDateError("End date must be after start date");
      return;
    }
    let result = [...reservations];
    if (dateFrom) result = result.filter((r) => r.checkInDate >= dateFrom);
    if (dateTo) result = result.filter((r) => r.checkInDate <= dateTo);
    if (filterStatus !== "All") result = result.filter((r) => r.status === filterStatus);
    if (filterRoom !== "All") result = result.filter((r) => r.roomType === filterRoom);
    setFiltered(result);
    toast.success("Showing " + result.length + " reservations");
  }

  function resetFilters() {
    setDateFrom("");
    setDateTo("");
    setFilterStatus("All");
    setFilterRoom("All");
    setDateError("");
    setFiltered(reservations);
  }

  function handlePrint() {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(
      "<html><head><title>OceanView Report</title>" +
      "<style>body{font-family:Arial,sans-serif;padding:30px;font-size:13px}" +
      "h1{color:#1a3c6e;border-bottom:2px solid #1a3c6e;padding-bottom:8px}" +
      "table{width:100%;border-collapse:collapse;margin-top:10px}" +
      "th{background:#1a3c6e;color:white;padding:8px;text-align:left;font-size:12px}" +
      "td{padding:7px 8px;border-bottom:1px solid #eee;font-size:12px}" +
      "tr:nth-child(even) td{background:#f8f9fa}" +
      ".stat{display:inline-block;background:#f0f4f8;padding:10px 18px;border-radius:6px;border-left:4px solid #1a3c6e;margin:0 10px 10px 0}" +
      ".footer{margin-top:30px;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:12px}" +
      "</style></head><body>" + content + "</body></html>"
    );
    win.document.close();
    win.print();
  }

  // Stats
  const nonCancelled = filtered.filter((r) => r.status !== "Cancelled");
  const totalIncome = nonCancelled.reduce((s, r) => s + (Number(r.totalBill) || 0), 0);
  const avgBill = nonCancelled.length ? Math.round(totalIncome / nonCancelled.length) : 0;
  const cancelledCount = filtered.filter((r) => r.status === "Cancelled").length;
  const cancelRate = filtered.length ? Math.round((cancelledCount / filtered.length) * 100) : 0;

  const statusData = ["Pending", "Confirmed", "Checked-In", "Checked-Out", "Cancelled"].map((s) => ({
    label: s,
    value: filtered.filter((r) => r.status === s).length,
  }));

  const roomData = ["Standard", "Deluxe", "Suite"].map((r) => ({
    label: r,
    value: filtered.filter((x) => x.roomType === r).length,
  }));

  const incomeByRoom = ["Standard", "Deluxe", "Suite"].map((r) => ({
    type: r,
    value: filtered.filter((x) => x.roomType === r && x.status !== "Cancelled").reduce((s, x) => s + (Number(x.totalBill) || 0), 0),
  }));

  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    return {
      label: d.toLocaleString("default", { month: "short" }),
      value: filtered.filter((r) => r.checkInDate && r.checkInDate.startsWith(m)).length,
    };
  });

  const inputStyle = (hasError) => ({
    padding: "9px 12px",
    border: "1px solid " + (hasError ? "#dc3545" : "#ddd"),
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  });

  const statusColor = (s) => {
    if (s === "Confirmed") return { background: "#d1e7dd", color: "#0f5132" };
    if (s === "Checked-In") return { background: "#cfe2ff", color: "#084298" };
    if (s === "Checked-Out") return { background: "#e2e3e5", color: "#41464b" };
    if (s === "Cancelled") return { background: "#f8d7da", color: "#842029" };
    return { background: "#fff3cd", color: "#856404" };
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="Reports & Analytics" />
        <div style={{ padding: 24 }}>

          {/* Filter Bar */}
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 16px", color: "#111827" }}>🔍 Filter Reports</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, alignItems: "end" }}>
              <div>
                <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#555" }}>From Date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle(!!dateError)} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#555" }}>To Date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle(!!dateError)} />
                {dateError && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#dc3545" }}>{dateError}</p>}
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#555" }}>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={inputStyle(false)}>
                  {["All", "Pending", "Confirmed", "Checked-In", "Checked-Out", "Cancelled"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold", color: "#555" }}>Room Type</label>
                <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} style={inputStyle(false)}>
                  {["All", "Standard", "Deluxe", "Suite"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={applyFilters} style={{ flex: 1, padding: "9px 0", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: 13 }}>
                  Apply
                </button>
                <button onClick={resetFilters} style={{ flex: 1, padding: "9px 0", background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: 40, color: "#888" }}>⏳ Loading...</p>
          ) : (
            <>
              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <StatCard title="Total Reservations" value={filtered.length}                                  icon="🛎️" color="#0d6efd" bg="#e7f0ff" />
                <StatCard title="Total Income"        value={"LKR " + totalIncome.toLocaleString()}           icon="💰" color="#198754" bg="#e8f5e9" sub="Excl. Cancelled" />
                <StatCard title="Average Bill"        value={"LKR " + avgBill.toLocaleString()}               icon="📊" color="#f59e0b" bg="#fff8e1" />
                <StatCard title="Cancellation Rate"   value={cancelRate + "%"}                                icon="❌" color="#dc3545" bg="#fdecea" />
              </div>

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                <BarChart data={monthlyData} title="📅 Monthly Bookings" color="#0d6efd" />
                <PieChart data={statusData}  title="📋 Reservations by Status" />
                <PieChart data={roomData}    title="🏨 Bookings by Room Type" />
              </div>

              {/* Income by Room */}
              <div style={{ background: "#fff", borderRadius: 10, padding: 20, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <h4 style={{ margin: "0 0 14px", color: "#111827" }}>💰 Income by Room Type</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {incomeByRoom.map((r) => (
                    <div key={r.type} style={{ background: "#f8f9fa", borderRadius: 8, padding: "16px 20px", borderLeft: "4px solid #198754" }}>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}>{r.type}</p>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: "bold", color: "#198754" }}>LKR {r.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Printable Detail Table */}
              <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, color: "#111827" }}>📄 Detailed Reservation Report</h3>
                  <button onClick={handlePrint} style={{ padding: "9px 20px", background: "#6f42c1", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>
                    🖨️ Print Report
                  </button>
                </div>

                {/* Hidden print content */}
                <div ref={printRef} style={{ display: "none" }}>
                  <h1>OceanView Resort — Reservation Report</h1>
                  <p>Generated: {new Date().toLocaleString()}</p>
                  <div>
                    <span className="stat">Total: {filtered.length}</span>
                    <span className="stat">Income: LKR {totalIncome.toLocaleString()}</span>
                    <span className="stat">Avg Bill: LKR {avgBill.toLocaleString()}</span>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        {["#", "Res. No", "Guest Name", "Room", "Check-In", "Check-Out", "Status", "Total Bill"].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, i) => (
                        <tr key={r.id}>
                          <td>{i + 1}</td>
                          <td>{r.reservationNumber}</td>
                          <td>{r.guestName}</td>
                          <td>{r.roomType}</td>
                          <td>{r.checkInDate}</td>
                          <td>{r.checkOutDate}</td>
                          <td>{r.status}</td>
                          <td>LKR {Number(r.totalBill).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="footer">OceanView Resort Reservation System — Confidential</div>
                </div>

                {/* Visible table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                    <thead>
                      <tr style={{ background: "#f8f9fa" }}>
                        {["#", "Res. No", "Guest Name", "Room Type", "Check-In", "Check-Out", "Status", "Total Bill"].map((h) => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 13, color: "#444", borderBottom: "2px solid #dee2e6", fontWeight: "bold", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: 30, color: "#888" }}>
                            No records match your filters
                          </td>
                        </tr>
                      ) : (
                        filtered.map((r, i) => (
                          <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "#f8f9ff")}
                            onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
                          >
                            <td style={{ padding: "10px 12px", fontSize: 14, color: "#888" }}>{i + 1}</td>
                            <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: "bold" }}>{r.reservationNumber}</td>
                            <td style={{ padding: "10px 12px", fontSize: 14 }}>{r.guestName}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{
                                padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: "bold",
                                background: r.roomType === "Suite" ? "#f3e8ff" : r.roomType === "Deluxe" ? "#fff3cd" : "#e8f5e9",
                                color: r.roomType === "Suite" ? "#6f42c1" : r.roomType === "Deluxe" ? "#856404" : "#2e7d32",
                              }}>
                                {r.roomType}
                              </span>
                            </td>
                            <td style={{ padding: "10px 12px", fontSize: 14 }}>{r.checkInDate}</td>
                            <td style={{ padding: "10px 12px", fontSize: 14 }}>{r.checkOutDate}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: "bold", ...statusColor(r.status) }}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: "bold", color: "#198754" }}>
                              LKR {Number(r.totalBill).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Reports;