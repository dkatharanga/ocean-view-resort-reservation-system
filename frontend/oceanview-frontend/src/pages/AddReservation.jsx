import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import API from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddReservation = () => {
  const [form, setForm] = useState({
    reservationNumber: "",
    guestName: "",
    address: "",
    contactNumber: "",
    roomType: "Standard",
    checkInDate: "",
    checkOutDate: "",
  });

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showReceipt, setShowReceipt] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("Please login first");
      window.location.href = "/login";
    }
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/reservations");
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateBill = (roomType, checkInDate, checkOutDate) => {
    const rate = roomType === "Standard" ? 5000 : roomType === "Deluxe" ? 8000 : 12000;
    const nights = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    return { nights, totalBill: nights * rate };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.checkInDate || !form.checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    const { nights, totalBill } = calculateBill(form.roomType, form.checkInDate, form.checkOutDate);

    if (nights <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    try {
      if (editId) {
        await API.put(`/api/reservations/${editId}`, {
          reservationNumber: form.reservationNumber,
          guestName:         form.guestName,
          address:           form.address,
          contactNumber:     form.contactNumber,
          roomType:          form.roomType,
          checkInDate:       form.checkInDate,
          checkOutDate:      form.checkOutDate,
          totalBill:         totalBill,
          status:            "Pending",
        });
        toast.success("Reservation updated successfully");
        setEditId(null);
      } else {
        await API.post("/api/reservations", { ...form, totalBill, status: "Pending" });
        toast.success("Reservation added successfully");
      }

      setForm({
        reservationNumber: "",
        guestName: "",
        address: "",
        contactNumber: "",
        roomType: "Standard",
        checkInDate: "",
        checkOutDate: "",
      });

      loadReservations();
    } catch (err) {
      toast.error(editId ? "Error updating reservation" : "Error adding reservation");
    }
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setForm({
      reservationNumber: r.reservationNumber,
      guestName:         r.guestName,
      address:           r.address || "",
      contactNumber:     r.contactNumber || "",
      roomType:          r.roomType,
      checkInDate:       r.checkInDate,
      checkOutDate:      r.checkOutDate,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({
      reservationNumber: "",
      guestName: "",
      address: "",
      contactNumber: "",
      roomType: "Standard",
      checkInDate: "",
      checkOutDate: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    try {
      await API.delete(`/api/reservations/${id}`);
      toast.success("Reservation deleted");
      loadReservations();
    } catch (err) {
      toast.error("Error deleting reservation");
    }
  };

  const handleStatusChange = async (r, newStatus) => {
    try {
      await API.put(`/api/reservations/${r.id}`, {
        reservationNumber: r.reservationNumber,
        guestName:         r.guestName,
        address:           r.address,
        contactNumber:     r.contactNumber,
        roomType:          r.roomType,
        checkInDate:       r.checkInDate,
        checkOutDate:      r.checkOutDate,
        totalBill:         r.totalBill,
        status:            newStatus,
      });
      toast.success(`Status changed to ${newStatus}`);
      loadReservations();
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const handlePrint = (r) => {
    setShowReceipt(r);
    setTimeout(() => {
      const printContent = receiptRef.current.innerHTML;
      const win = window.open("", "_blank");
      win.document.write(`
        <html>
          <head>
            <title>Receipt - ${r.reservationNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 500px; margin: auto; }
              h2 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .subtitle { text-align: center; color: #888; margin-bottom: 20px; font-size: 14px; }
              .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ddd; font-size: 14px; }
              .label { font-weight: bold; color: #555; }
              .total { font-size: 16px; font-weight: bold; color: #000; margin-top: 6px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      win.document.close();
      win.print();
      setShowReceipt(null);
    }, 100);
  };

  const statusColors = {
    Pending:       { background: "#fff3cd", color: "#856404" },
    Confirmed:     { background: "#d1e7dd", color: "#0f5132" },
    "Checked-In":  { background: "#cfe2ff", color: "#084298" },
    "Checked-Out": { background: "#e2e3e5", color: "#41464b" },
    Cancelled:     { background: "#f8d7da", color: "#842029" },
  };

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    fontSize: "13px",
    color: "#555",
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="Reservations" />

        <div style={{ padding: "24px" }}>

          {/* STATS CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <DashboardCard title="Total Reservations" value={reservations.length} />
            <DashboardCard title="Pending"    value={reservations.filter(r => r.status === "Pending").length} />
            <DashboardCard title="Confirmed"  value={reservations.filter(r => r.status === "Confirmed").length} />
            <DashboardCard title="Cancelled"  value={reservations.filter(r => r.status === "Cancelled").length} />
          </div>

          {/* ✅ FULL WIDTH FORM */}
          <div style={{
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "24px",
            marginBottom: "24px",
          }}>
            <h3 style={{ marginBottom: "20px", color: "#111827", fontSize: "18px", borderBottom: "1px solid #f0f0f0", paddingBottom: "12px" }}>
              {editId ? "✏️ Edit Reservation" : "➕ Add New Reservation"}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* ROW 1 — 4 columns */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Reservation Number</label>
                  <input name="reservationNumber" placeholder="e.g. OCV001" value={form.reservationNumber} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Guest Name</label>
                  <input name="guestName" placeholder="Full name" value={form.guestName} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Contact Number</label>
                  <input name="contactNumber" placeholder="+94 77 123 4567" value={form.contactNumber} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Room Type</label>
                  <select name="roomType" value={form.roomType} onChange={handleChange} style={inputStyle}>
                    <option value="Standard">Standard — LKR 5,000/night</option>
                    <option value="Deluxe">Deluxe — LKR 8,000/night</option>
                    <option value="Suite">Suite — LKR 12,000/night</option>
                  </select>
                </div>
              </div>

              {/* ROW 2 — address spans 2, dates take 1 each */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "16px" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Address</label>
                  <input name="address" placeholder="Guest address" value={form.address} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Check-In Date</label>
                  <input type="date" name="checkInDate" value={form.checkInDate} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Check-Out Date</label>
                  <input type="date" name="checkOutDate" value={form.checkOutDate} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>

              {/* BILL PREVIEW */}
              {form.checkInDate && form.checkOutDate && new Date(form.checkOutDate) > new Date(form.checkInDate) && (
                <div style={{
                  background: "#f0f7ff",
                  border: "1px solid #cfe2ff",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  color: "#084298",
                }}>
                  💰 Estimated Bill: <strong>LKR {calculateBill(form.roomType, form.checkInDate, form.checkOutDate).totalBill.toLocaleString()}</strong>
                  {" "}({calculateBill(form.roomType, form.checkInDate, form.checkOutDate).nights} night/s)
                </div>
              )}

              {/* SUBMIT BUTTONS */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" style={{
                  padding: "11px 32px",
                  background: editId ? "#0d6efd" : "#198754",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                }}>
                  {editId ? "✏️ Update Reservation" : "➕ Add Reservation"}
                </button>
                {editId && (
                  <button type="button" onClick={handleCancelEdit} style={{
                    padding: "11px 32px",
                    background: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}>
                    ✕ Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ✅ FULL WIDTH TABLE */}
          <div style={{
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "24px",
            overflowX: "auto",
          }}>
            <h3 style={{ marginBottom: "16px", color: "#111827", fontSize: "18px", borderBottom: "1px solid #f0f0f0", paddingBottom: "12px" }}>
              📋 All Reservations
            </h3>

            {loading ? (
              <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>⏳ Loading...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    {["#", "Res. No", "Guest Name", "Room Type", "Check-In", "Check-Out", "Nights", "Total Bill", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 10px", textAlign: "left", fontWeight: "bold", color: "#444", borderBottom: "2px solid #dee2e6", fontSize: "13px", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                        No reservations found. Add one above!
                      </td>
                    </tr>
                  ) : (
                    reservations.map((r, i) => {
                      const nights = r.checkInDate && r.checkOutDate
                        ? Math.round((new Date(r.checkOutDate) - new Date(r.checkInDate)) / (1000 * 60 * 60 * 24))
                        : "-";
                      return (
                        <tr key={r.id}
                          style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.1s" }}
                          onMouseOver={e => e.currentTarget.style.background = "#f8f9ff"}
                          onMouseOut={e  => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "11px 10px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                          <td style={{ padding: "11px 10px", fontSize: "14px", fontWeight: "bold", color: "#111827" }}>{r.reservationNumber}</td>
                          <td style={{ padding: "11px 10px", fontSize: "14px" }}>{r.guestName}</td>
                          <td style={{ padding: "11px 10px" }}>
                            <span style={{
                              padding: "3px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              background: r.roomType === "Suite" ? "#f3e8ff" : r.roomType === "Deluxe" ? "#fff3cd" : "#e8f5e9",
                              color:      r.roomType === "Suite" ? "#6f42c1" : r.roomType === "Deluxe" ? "#856404" : "#2e7d32",
                            }}>
                              {r.roomType}
                            </span>
                          </td>
                          <td style={{ padding: "11px 10px", fontSize: "14px" }}>{r.checkInDate}</td>
                          <td style={{ padding: "11px 10px", fontSize: "14px" }}>{r.checkOutDate}</td>
                          <td style={{ padding: "11px 10px", fontSize: "14px", textAlign: "center" }}>{nights}</td>
                          <td style={{ padding: "11px 10px", fontSize: "14px", fontWeight: "bold", color: "#198754" }}>
                            LKR {Number(r.totalBill).toLocaleString()}
                          </td>
                          <td style={{ padding: "11px 10px" }}>
                            <select
                              value={r.status}
                              onChange={(e) => handleStatusChange(r, e.target.value)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "12px",
                                border: "none",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "12px",
                                ...(statusColors[r.status] || {}),
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Checked-In">Checked-In</option>
                              <option value="Checked-Out">Checked-Out</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td style={{ padding: "11px 10px", whiteSpace: "nowrap" }}>
                            <button onClick={() => handleEdit(r)} style={{ marginRight: "5px", padding: "5px 10px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleDelete(r.id)} style={{ marginRight: "5px", padding: "5px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                              🗑️ Delete
                            </button>
                            <button onClick={() => handlePrint(r)} style={{ padding: "5px 10px", background: "#6f42c1", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                              🖨️ Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>

      {/* HIDDEN RECEIPT TEMPLATE */}
      <div style={{ display: "none" }}>
        <div ref={receiptRef}>
          {showReceipt && (
            <>
              <h2>🏨 OceanView Hotel</h2>
              <p className="subtitle">Reservation Receipt</p>
              <div className="row"><span className="label">Reservation No:</span><span>{showReceipt.reservationNumber}</span></div>
              <div className="row"><span className="label">Guest Name:</span><span>{showReceipt.guestName}</span></div>
              <div className="row"><span className="label">Address:</span><span>{showReceipt.address}</span></div>
              <div className="row"><span className="label">Contact:</span><span>{showReceipt.contactNumber}</span></div>
              <div className="row"><span className="label">Room Type:</span><span>{showReceipt.roomType}</span></div>
              <div className="row"><span className="label">Check-In:</span><span>{showReceipt.checkInDate}</span></div>
              <div className="row"><span className="label">Check-Out:</span><span>{showReceipt.checkOutDate}</span></div>
              <div className="row"><span className="label">Status:</span><span>{showReceipt.status}</span></div>
              <div className="row total"><span className="label">Total Bill:</span><span>LKR {Number(showReceipt.totalBill).toLocaleString()}</span></div>
              <div className="footer">
                <p>Thank you for choosing OceanView Hotel!</p>
                <p>Printed on: {new Date().toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddReservation;