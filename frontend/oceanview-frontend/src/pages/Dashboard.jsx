import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

// ── Total room inventory (change these numbers to match your hotel) ────────────
const ROOM_INVENTORY = {
  Standard: 10,
  Deluxe:   6,
  Suite:    4,
};
const TOTAL_ROOMS = Object.values(ROOM_INVENTORY).reduce((a, b) => a + b, 0); // 20

function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { window.location.href = "/login"; return; }
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await API.get("/api/reservations");
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const active        = reservations.filter((r) => r.status !== "Cancelled");
  const totalIncome   = active.reduce((s, r) => s + (Number(r.totalBill) || 0), 0);
  const checkedIn     = reservations.filter((r) => r.status === "Checked-In");

  // Occupied = rooms with Checked-In status RIGHT NOW
  const occupiedStandard = checkedIn.filter((r) => r.roomType === "Standard").length;
  const occupiedDeluxe   = checkedIn.filter((r) => r.roomType === "Deluxe").length;
  const occupiedSuite    = checkedIn.filter((r) => r.roomType === "Suite").length;
  const totalOccupied    = occupiedStandard + occupiedDeluxe + occupiedSuite;

  // Available = total inventory minus currently occupied
  const availStandard = Math.max(ROOM_INVENTORY.Standard - occupiedStandard, 0);
  const availDeluxe   = Math.max(ROOM_INVENTORY.Deluxe   - occupiedDeluxe,   0);
  const availSuite    = Math.max(ROOM_INVENTORY.Suite     - occupiedSuite,    0);
  const totalAvail    = availStandard + availDeluxe + availSuite;

  const occupancyPct  = Math.round((totalOccupied / TOTAL_ROOMS) * 100);

  // Status counts
  const pendingCount    = reservations.filter((r) => r.status === "Pending").length;
  const confirmedCount  = reservations.filter((r) => r.status === "Confirmed").length;
  const checkedOutCount = reservations.filter((r) => r.status === "Checked-Out").length;
  const cancelledCount  = reservations.filter((r) => r.status === "Cancelled").length;

  // Top stat cards
  const topCards = [
    { title: "Total Reservations", value: reservations.length,                   icon: "🛎️", color: "#0d6efd", bg: "#e7f0ff" },
    { title: "Active Guests",      value: active.length,                          icon: "👥", color: "#198754", bg: "#e8f5e9" },
    { title: "Total Income",       value: "LKR " + totalIncome.toLocaleString(),  icon: "💰", color: "#f59e0b", bg: "#fff8e1", small: true },
    { title: "Rooms Available",    value: totalAvail + " / " + TOTAL_ROOMS,       icon: "🏨", color: totalAvail === 0 ? "#dc3545" : "#0891b2", bg: totalAvail === 0 ? "#fdecea" : "#ecfeff" },
  ];

  // Status cards
  const statusCards = [
    { title: "Pending",      value: pendingCount,    icon: "⏳", color: "#856404", bg: "#fff3cd" },
    { title: "Confirmed",    value: confirmedCount,  icon: "✅", color: "#0f5132", bg: "#d1e7dd" },
    { title: "Checked-In",  value: checkedIn.length,icon: "🏨", color: "#084298", bg: "#cfe2ff" },
    { title: "Checked-Out", value: checkedOutCount,  icon: "🚪", color: "#41464b", bg: "#e2e3e5" },
    { title: "Cancelled",   value: cancelledCount,   icon: "❌", color: "#842029", bg: "#f8d7da" },
  ];

  function Card({ title, value, icon, color, bg, small }) {
    return (
      <div style={{
        background: "#fff", borderRadius: 10, padding: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: "4px solid " + color,
        transition: "transform 0.2s",
      }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
        onMouseOut={(e)  => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</p>
            <p style={{ margin: 0, fontSize: small ? 18 : 26, fontWeight: "bold", color }}>{value}</p>
          </div>
          <div style={{ width: 44, height: 44, background: bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            {icon}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="Dashboard" />

        <div style={{ padding: 24 }}>

          {/* Welcome Banner */}
          <div style={{
            background: "linear-gradient(135deg, #1a1a2e, #16213e)",
            color: "#fff", borderRadius: 12, padding: "28px 32px",
            marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>🌊 Welcome to OceanView Resort</h2>
              <p style={{ margin: "6px 0 0", color: "#aaa", fontSize: 14 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div style={{ fontSize: 48 }}>🏖️</div>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: 40, color: "#888" }}>⏳ Loading dashboard data...</p>
          ) : (
            <>
              {/* Top 4 Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
                {topCards.map((c) => <Card key={c.title} {...c} />)}
              </div>

              {/* ── AVAILABLE ROOMS BREAKDOWN ───────────────────────────── */}
              <div style={{ background: "#fff", borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, color: "#111827", fontSize: 16 }}>🏨 Room Availability</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "#888" }}>Occupancy Rate:</span>
                    <span style={{ fontWeight: "bold", fontSize: 15, color: occupancyPct >= 80 ? "#dc3545" : occupancyPct >= 50 ? "#f59e0b" : "#198754" }}>
                      {occupancyPct}%
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                  {[
                    { type: "Standard", total: ROOM_INVENTORY.Standard, occupied: occupiedStandard, avail: availStandard, color: "#2e7d32", bg: "#e8f5e9", border: "#a5d6a7" },
                    { type: "Deluxe",   total: ROOM_INVENTORY.Deluxe,   occupied: occupiedDeluxe,   avail: availDeluxe,   color: "#856404", bg: "#fff3cd", border: "#ffe082" },
                    { type: "Suite",    total: ROOM_INVENTORY.Suite,    occupied: occupiedSuite,    avail: availSuite,    color: "#6f42c1", bg: "#f3e8ff", border: "#ce93d8" },
                  ].map((r) => {
                    const pct = Math.round((r.occupied / r.total) * 100);
                    return (
                      <div key={r.type} style={{ background: r.bg, borderRadius: 10, padding: 18, border: "1px solid " + r.border }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontWeight: "bold", fontSize: 15, color: r.color }}>{r.type}</span>
                          <span style={{ fontSize: 12, color: r.color, background: "#fff", padding: "2px 8px", borderRadius: 10, fontWeight: "bold" }}>
                            {pct}% full
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 6, height: 8, marginBottom: 12, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 6, background: r.color,
                            width: pct + "%", transition: "width 0.5s ease",
                          }} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 22, fontWeight: "bold", color: r.color }}>{r.avail}</div>
                            <div style={{ fontSize: 11, color: r.color, opacity: 0.8 }}>Available</div>
                          </div>
                          <div style={{ width: 1, background: r.border }} />
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 22, fontWeight: "bold", color: r.color }}>{r.occupied}</div>
                            <div style={{ fontSize: 11, color: r.color, opacity: 0.8 }}>Occupied</div>
                          </div>
                          <div style={{ width: 1, background: r.border }} />
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 22, fontWeight: "bold", color: r.color }}>{r.total}</div>
                            <div style={{ fontSize: 11, color: r.color, opacity: 0.8 }}>Total</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total summary bar */}
                <div style={{ background: "#f8f9fa", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div>
                      <span style={{ fontSize: 12, color: "#888" }}>Total Available: </span>
                      <span style={{ fontWeight: "bold", color: "#198754", fontSize: 16 }}>{totalAvail}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, color: "#888" }}>Total Occupied: </span>
                      <span style={{ fontWeight: "bold", color: "#dc3545", fontSize: 16 }}>{totalOccupied}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, color: "#888" }}>Total Rooms: </span>
                      <span style={{ fontWeight: "bold", color: "#0d6efd", fontSize: 16 }}>{TOTAL_ROOMS}</span>
                    </div>
                  </div>
                  {totalAvail === 0 && (
                    <span style={{ background: "#f8d7da", color: "#842029", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: "bold" }}>
                      🔴 Fully Occupied
                    </span>
                  )}
                  {totalAvail > 0 && totalAvail <= 3 && (
                    <span style={{ background: "#fff3cd", color: "#856404", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: "bold" }}>
                      🟡 Almost Full
                    </span>
                  )}
                  {totalAvail > 3 && (
                    <span style={{ background: "#d1e7dd", color: "#0f5132", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: "bold" }}>
                      🟢 Rooms Available
                    </span>
                  )}
                </div>
              </div>

              {/* Status Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 20 }}>
                {statusCards.map((c) => <Card key={c.title} {...c} />)}
              </div>

              {/* Recent Reservations Table */}
              <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: 24 }}>
                <h3 style={{ margin: "0 0 16px", color: "#111827", borderBottom: "1px solid #f0f0f0", paddingBottom: 12 }}>
                  📋 Recent Reservations
                </h3>
                {reservations.length === 0 ? (
                  <p style={{ textAlign: "center", padding: 20, color: "#888" }}>No reservations yet.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8f9fa" }}>
                        {["#", "Reservation No", "Guest Name", "Room Type", "Check-In", "Check-Out", "Status", "Total Bill"].map((h) => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 13, color: "#555", borderBottom: "2px solid #dee2e6", fontWeight: "bold" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.slice(0, 10).map((r, i) => (
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
                              color:      r.roomType === "Suite" ? "#6f42c1" : r.roomType === "Deluxe" ? "#856404" : "#2e7d32",
                            }}>
                              {r.roomType}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 14 }}>{r.checkInDate}</td>
                          <td style={{ padding: "10px 12px", fontSize: 14 }}>{r.checkOutDate}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: "bold",
                              background:
                                r.status === "Confirmed"    ? "#d1e7dd" :
                                r.status === "Checked-In"  ? "#cfe2ff" :
                                r.status === "Checked-Out" ? "#e2e3e5" :
                                r.status === "Cancelled"   ? "#f8d7da" : "#fff3cd",
                              color:
                                r.status === "Confirmed"    ? "#0f5132" :
                                r.status === "Checked-In"  ? "#084298" :
                                r.status === "Checked-Out" ? "#41464b" :
                                r.status === "Cancelled"   ? "#842029" : "#856404",
                            }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: "bold", color: "#198754" }}>
                            LKR {Number(r.totalBill).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;