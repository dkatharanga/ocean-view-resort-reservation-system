import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "getting-started",
    icon: "🚀",
    label: "Getting Started",
    color: "#2563eb",
    light: "#eff6ff",
    border: "#93c5fd",
    topics: [
      {
        title: "How to Login",
        content: "Open your browser and go to http://localhost:3000. Enter the username and password provided by your Administrator. Click Login. You will be taken to the Dashboard automatically.",
        tips: ["Your username is case-sensitive — type it exactly as given", "Password must be at least 4 characters", "If you see 'User not found', check the spelling of your username", "Contact your Admin if you cannot log in"],
        warning: null,
      },
      {
        title: "Understanding the Dashboard",
        content: "The Dashboard is your home screen. It shows live statistics pulled directly from the database — total reservations, active guests, total income, and a breakdown by status.",
        tips: ["All numbers update in real time as reservations change", "The Recent Reservations table shows your 10 latest bookings", "Income excludes Cancelled reservations automatically"],
        warning: null,
      },
      {
        title: "Navigating with the Sidebar",
        content: "The dark sidebar on the left is your main navigation tool. Click any item to go to that section. The currently active page is highlighted in blue.",
        tips: ["📊 Dashboard — overview and statistics", "🛎️ Reservations — add, edit, delete bookings", "📈 Reports — analytics and printable reports", "👥 User Management — Admin only", "❓ Help — this guide", "🚪 Exit — click to safely log out"],
        warning: null,
      },
      {
        title: "How to Log Out",
        content: "Click the red Exit button at the bottom of the sidebar at any time. This clears your session and returns you to the Login page.",
        tips: ["Always log out when leaving your workstation", "Simply closing the browser tab also ends your session"],
        warning: "Never leave the system open on an unattended computer. Guest data is confidential.",
      },
    ],
  },
  {
    id: "reservations",
    icon: "🛎️",
    label: "Reservations",
    color: "#059669",
    light: "#ecfdf5",
    border: "#6ee7b7",
    topics: [
      {
        title: "Adding a New Reservation",
        content: "Go to Reservations from the sidebar. The Add New Reservation form is at the top of the page. Fill in all fields and click Add Reservation.",
        tips: [
          "Reservation Number must be unique — suggested format: OCV001, OCV002...",
          "Guest Name is required (minimum 2 characters)",
          "Contact Number format: +94 77 123 4567 or similar",
          "Room rates: Standard = LKR 5,000/night | Deluxe = LKR 8,000/night | Suite = LKR 12,000/night",
          "A live blue bill preview box appears automatically when valid dates are selected — no manual calculation needed",
        ],
        warning: "Check-Out date MUST be after Check-In date. The form will show an error and will not save if dates are wrong.",
      },
      {
        title: "Viewing All Reservations",
        content: "Scroll down the Reservations page to see the full table of all reservations. Each row shows the reservation number, guest name, room type badge, dates, nights, bill, and status.",
        tips: [
          "Hover any row to highlight it",
          "Room badges are colour-coded: 🟢 Green = Standard | 🟡 Yellow = Deluxe | 🟣 Purple = Suite",
          "The Nights column is calculated automatically from the dates",
          "Total Income on the Dashboard excludes Cancelled reservations",
        ],
        warning: null,
      },
      {
        title: "Editing a Reservation",
        content: "Find the reservation row in the table and click the ✏️ Edit button. The form at the top of the page will fill with the existing details. Make your changes then click Update Reservation.",
        tips: [
          "The form title changes from 'Add New Reservation' to 'Edit Reservation' so you know you are in edit mode",
          "Click ✕ Cancel to discard all changes and go back to Add mode",
          "The page scrolls to the top automatically so you can see the form",
        ],
        warning: null,
      },
      {
        title: "Changing a Reservation Status",
        content: "In the Status column of the reservation table, click the coloured status badge. A dropdown appears — select the new status. It saves automatically.",
        tips: [
          "Recommended flow: Pending → Confirmed → Checked-In → Checked-Out",
          "Use Cancelled for bookings that will not proceed",
          "Status colours: 🟡 Yellow=Pending | 🟢 Green=Confirmed | 🔵 Blue=Checked-In | ⚪ Grey=Checked-Out | 🔴 Red=Cancelled",
        ],
        warning: "Cancelled reservations are excluded from income totals in both the Dashboard and Reports.",
      },
      {
        title: "Deleting a Reservation",
        content: "Click the 🗑️ Delete button on the reservation row. A confirmation dialog will appear. Click OK to permanently delete the record.",
        tips: ["Double-check you have the correct row before confirming", "Consider setting status to Cancelled instead of deleting — it keeps a record"],
        warning: "Deletion is PERMANENT and cannot be undone. There is no recycle bin.",
      },
      {
        title: "Printing a Guest Receipt",
        content: "Click the 🖨️ Receipt button on any reservation row. A formatted receipt opens in a new browser tab with all guest and booking details.",
        tips: [
          "The receipt includes: Reservation No, Guest Name, Contact, Address, Room Type, Dates, Status, Total Bill, and print timestamp",
          "Use your browser's Print dialog to print or save as PDF",
          "Receipt layout is pre-formatted — no editing needed",
        ],
        warning: null,
      },
    ],
  },
  {
    id: "reports",
    icon: "📈",
    label: "Reports & Analytics",
    color: "#d97706",
    light: "#fffbeb",
    border: "#fcd34d",
    topics: [
      {
        title: "Viewing the Reports Page",
        content: "Click Reports in the sidebar. The page shows 4 summary stat cards, 3 charts (Monthly Bookings, Status Distribution, Room Type Distribution), an Income by Room Type panel, and a full filterable detail table.",
        tips: [
          "Stat cards: Total Reservations | Total Income (excl. Cancelled) | Average Bill | Cancellation Rate",
          "Monthly Bookings chart shows the last 6 months",
          "All charts update when you apply filters",
        ],
        warning: null,
      },
      {
        title: "Filtering Report Data",
        content: "Use the filter bar at the top of the Reports page. You can filter by date range (From / To), reservation status, and room type. Click Apply to update everything.",
        tips: [
          "Leave date fields blank to include all dates",
          "Select 'All' in dropdowns to include all statuses or room types",
          "Filters can be combined — e.g. Confirmed + Suite rooms in March",
          "Click Reset to restore all unfiltered data",
        ],
        warning: "The To date must be on or after the From date. An error message will appear if this rule is broken.",
      },
      {
        title: "Printing the Report",
        content: "After applying filters, click the 🖨️ Print Report button. A formatted report opens in a new tab showing the filter criteria, summary totals, and the full data table.",
        tips: [
          "The report header shows which filters are active",
          "Save as PDF using your browser's print → Save as PDF option",
          "Only the currently filtered records are included — not all reservations",
        ],
        warning: null,
      },
    ],
  },
  {
    id: "users",
    icon: "👥",
    label: "User Management",
    color: "#7c3aed",
    light: "#f5f3ff",
    border: "#c4b5fd",
    topics: [
      {
        title: "Who Can Access User Management?",
        content: "Only users with the ADMIN role can see and use the User Management page. If you have the USER role, this menu item will not appear in your sidebar.",
        tips: ["Ask your Administrator to upgrade your role if you need access", "ADMIN role gives full access to all pages including User Management"],
        warning: null,
      },
      {
        title: "Adding a New Staff Account",
        content: "Go to User Management and click ➕ Add User. Fill in the username, email, password, and select a role. Click Create User.",
        tips: [
          "Username: minimum 3 characters, must be unique",
          "Email: must be a valid format (e.g. name@hotel.com), must be unique",
          "Password: minimum 4 characters — staff can change it later",
          "Role USER = standard staff access | Role ADMIN = full system access",
        ],
        warning: "Each username and email address must be unique. The system will reject duplicates with an error message.",
      },
      {
        title: "Editing a User Account",
        content: "Click ✏️ Edit next to a user. Update their details in the form. Leave the password field blank to keep their existing password. Click Update User.",
        tips: ["You can change roles — e.g. promote USER to ADMIN", "Changes take effect immediately at the user's next login"],
        warning: null,
      },
      {
        title: "Deleting a User Account",
        content: "Click 🗑️ Delete next to a user. Confirm in the dialog. The account is permanently removed.",
        tips: ["Use the 🔍 Search box to quickly find a user by name, email, or role", "Prefer disabling access by password change rather than deleting if the user may return"],
        warning: "You cannot delete your own account — the delete button is disabled on your own row. This prevents accidental lock-out.",
      },
    ],
  },
  {
    id: "validation",
    icon: "✅",
    label: "Validation & Errors",
    color: "#dc2626",
    light: "#fef2f2",
    border: "#fca5a5",
    topics: [
      {
        title: "What Is Validation?",
        content: "Validation is the system checking that all information entered is correct and complete before saving. This prevents invalid data from entering the database and causing problems.",
        tips: [
          "Red border on a field = that specific field has an error",
          "Red/orange toast notification (top-right) = a general form error",
          "Errors disappear as soon as you correct the value",
          "If an error persists, re-read the message carefully",
        ],
        warning: null,
      },
      {
        title: "Common Error Messages & Fixes",
        content: "Here are the errors you are most likely to see and how to fix each one:",
        tips: [
          "\"Reservation number is required\" → Type a unique reservation number (e.g. OCV005)",
          "\"Guest name is required\" → Enter the guest's full name",
          "\"Check-out date must be after check-in date\" → Fix the dates so checkout is later",
          "\"Please select check-in and check-out dates\" → Both date fields must be filled",
          "\"Username must be at least 3 characters\" → Type a longer username",
          "\"Valid email address required\" → Check the email format (must include @ and .)",
          "\"Password must be at least 4 characters\" → Use a longer password",
          "\"Username already exists\" → Choose a different username",
          "\"Invalid password\" → Re-enter your password carefully",
          "\"Please login first\" → Your session expired — go to login and sign in again",
        ],
        warning: null,
      },
    ],
  },
  {
    id: "bestpractices",
    icon: "💡",
    label: "Tips & Best Practices",
    color: "#0891b2",
    light: "#ecfeff",
    border: "#67e8f9",
    topics: [
      {
        title: "Recommended Reservation Numbering",
        content: "Use a consistent format for reservation numbers to make searching and auditing easy. The system does not auto-generate numbers so you set them manually.",
        tips: [
          "Recommended format: OCV001, OCV002, OCV003 (increment by 1)",
          "Alternative with year: OCV-2026-001 for multi-year records",
          "Check the reservations table before adding to avoid duplicate numbers",
          "Keep a physical log book as backup if needed",
        ],
        warning: null,
      },
      {
        title: "Daily Workflow for Front Desk Staff",
        content: "Follow this routine each working day to keep the system accurate and up to date:",
        tips: [
          "☀️ Morning: Open Dashboard → check today's Check-Ins (Confirmed bookings arriving today)",
          "🏨 Guest arrival: Go to Reservations → find booking → change status to Checked-In → print receipt for guest",
          "🚪 Guest departure: Find booking → change status to Checked-Out",
          "❌ Cancellation: Find booking → change status to Cancelled (do not delete)",
          "🌙 End of day: Go to Reports → filter by today's date → Print Report for records",
        ],
        warning: null,
      },
      {
        title: "Weekly Tasks",
        content: "Perform these tasks at the end of each week to maintain clean records:",
        tips: [
          "Run an income report for the week and save/print for management",
          "Review all Pending reservations and follow up for confirmation",
          "Check for any reservations stuck in Checked-In status past their checkout date",
          "Verify all staff accounts are still active and roles are correct (Admin)",
        ],
        warning: null,
      },
      {
        title: "Security Best Practices",
        content: "Follow these rules to keep guest data and system access secure at all times:",
        tips: [
          "Always click the 🚪 Exit button before leaving your workstation",
          "Never share your login credentials with anyone — including other staff",
          "Do not write passwords on sticky notes near the computer",
          "If you suspect your account was accessed by someone else, tell your Admin immediately",
          "Use a strong password when your Admin sets up your account",
        ],
        warning: "Guest personal information (name, contact, address) is confidential. Do not share reservation details with unauthorised persons.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const TopicCard = ({ topic, color, light, border, index }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      marginBottom: 12,
      boxShadow: open ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.05)",
      border: `1px solid ${open ? border : "#e5e7eb"}`,
      overflow: "hidden",
      transition: "box-shadow 0.2s, border-color 0.2s",
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "16px 20px", background: open ? light : "#fff",
          border: "none", cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: open ? color : "#e5e7eb",
            color: open ? "#fff" : "#888",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: "bold", flexShrink: 0,
            transition: "background 0.2s, color 0.2s",
          }}>
            {index + 1}
          </div>
          <span style={{ fontSize: 15, fontWeight: "600", color: open ? color : "#374151" }}>
            {topic.title}
          </span>
        </div>
        <span style={{ fontSize: 18, color: open ? color : "#9ca3af", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ⌄
        </span>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          <p style={{ margin: "0 0 14px", color: "#4b5563", fontSize: 14, lineHeight: 1.7, paddingTop: 4 }}>
            {topic.content}
          </p>

          {topic.tips && topic.tips.length > 0 && (
            <div style={{ background: light, border: `1px solid ${border}`, borderRadius: 8, padding: "12px 16px", marginBottom: topic.warning ? 12 : 0 }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: "700", color, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                Guidelines
              </p>
              {topic.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < topic.tips.length - 1 ? 8 : 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {topic.warning && (
            <div style={{
              background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: 8,
              padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
              <span style={{ fontSize: 13.5, color: "#92400e", lineHeight: 1.55 }}>{topic.warning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const Help = () => {
  const [activeId, setActiveId] = useState("getting-started");
  const [search, setSearch]     = useState("");

  const active = SECTIONS.find(s => s.id === activeId);
  const activeIdx = SECTIONS.findIndex(s => s.id === activeId);

  // Search across all sections
  const searchResults = search.trim().length >= 2
    ? SECTIONS.flatMap(sec =>
        sec.topics
          .filter(t =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.content.toLowerCase().includes(search.toLowerCase()) ||
            t.tips.some(tip => tip.toLowerCase().includes(search.toLowerCase()))
          )
          .map(t => ({ ...t, sec }))
      )
    : [];

  const isSearching = search.trim().length >= 2;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="Help & Staff Guidelines" />

        <div style={{ padding: "24px 28px" }}>

          {/* ── HERO ────────────────────────────────────────────────────── */}
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%)",
            borderRadius: 14, padding: "32px 36px", marginBottom: 28,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 12px", fontSize: 22 }}>📘</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24, color: "#fff", fontWeight: "700", letterSpacing: "-0.3px" }}>Staff Help Centre</h2>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>OceanView Resort Reservation System — New Staff Guide</p>
                </div>
              </div>
              <p style={{ margin: "0 0 20px", color: "#cbd5e1", fontSize: 14, maxWidth: 480, lineHeight: 1.6 }}>
                Everything you need to get started, manage reservations, generate reports, and keep the system running smoothly.
              </p>
              {/* Search */}
              <div style={{ position: "relative", maxWidth: 460 }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }}>🔍</span>
                <input
                  placeholder='Search guides... e.g. "add reservation", "print receipt"'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 14px 11px 42px", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.15)", fontSize: 13.5,
                    outline: "none", boxSizing: "border-box", color: "#fff",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(4px)",
                  }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
                )}
              </div>
            </div>
            <div style={{ fontSize: 80, opacity: 0.12, marginLeft: 20, userSelect: "none" }}>🏨</div>
          </div>

          {/* ── SEARCH RESULTS ─────────────────────────────────────────── */}
          {isSearching ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: "#111827", fontSize: 17 }}>
                  Search results for <span style={{ color: "#2563eb" }}>"{search}"</span>
                </h3>
                <span style={{ background: "#eff6ff", color: "#2563eb", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold" }}>{searchResults.length} found</span>
              </div>
              {searchResults.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 10, padding: "40px 20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: 15 }}>No results found. Try different keywords.</p>
                </div>
              ) : (
                searchResults.map((t, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 14 }}>{t.sec.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: "600", color: t.sec.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.sec.label}</span>
                    </div>
                    <TopicCard topic={t} color={t.sec.color} light={t.sec.light} border={t.sec.border} index={i} />
                  </div>
                ))
              )}
            </div>
          ) : (
            /* ── MAIN LAYOUT ─────────────────────────────────────────── */
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>

              {/* LEFT NAV */}
              <div>
                <div style={{ background: "#fff", borderRadius: 12, padding: "14px 10px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", position: "sticky", top: 80 }}>
                  <p style={{ margin: "4px 12px 12px", fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>
                    Sections
                  </p>

                  {SECTIONS.map(sec => {
                    const isActive = activeId === sec.id;
                    return (
                      <button key={sec.id} onClick={() => setActiveId(sec.id)} style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "10px 12px", borderRadius: 8, border: "none",
                        cursor: "pointer", textAlign: "left", marginBottom: 2,
                        fontSize: 13.5, fontWeight: isActive ? "700" : "400",
                        background: isActive ? sec.light : "transparent",
                        color: isActive ? sec.color : "#4b5563",
                        transition: "all 0.15s",
                      }}
                        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb"; }}
                        onMouseOut={e  => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span style={{ fontSize: 17, flexShrink: 0 }}>{sec.icon}</span>
                        <span style={{ flex: 1 }}>{sec.label}</span>
                        <span style={{ fontSize: 11, background: isActive ? sec.color : "#e5e7eb", color: isActive ? "#fff" : "#6b7280", borderRadius: 10, padding: "1px 7px", fontWeight: "600" }}>
                          {sec.topics.length}
                        </span>
                      </button>
                    );
                  })}

                  {/* Quick Ref */}
                  <div style={{ margin: "14px 4px 2px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 14px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: "700", color: "#059669" }}>⚡ Quick Rates</p>
                    {[["Standard","LKR 5,000"],["Deluxe","LKR 8,000"],["Suite","LKR 12,000"]].map(([t,r]) => (
                      <div key={t} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#374151", marginBottom: 2 }}>
                        <span>{t}</span><span style={{ fontWeight: "600", color: "#059669" }}>{r}/night</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT CONTENT */}
              {active && (
                <div>
                  {/* Section title bar */}
                  <div style={{
                    background: "#fff", borderRadius: 12, padding: "18px 24px",
                    marginBottom: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    display: "flex", alignItems: "center", gap: 16,
                    borderLeft: `5px solid ${active.color}`,
                  }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: active.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                      {active.icon}
                    </div>
                    <div>
                      <h2 style={{ margin: "0 0 3px", fontSize: 19, color: "#111827", fontWeight: "700" }}>{active.label}</h2>
                      <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{active.topics.length} topics in this section</p>
                    </div>
                    <div style={{ marginLeft: "auto", background: active.light, color: active.color, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: "700" }}>
                      Section {activeIdx + 1} of {SECTIONS.length}
                    </div>
                  </div>

                  {/* Topics */}
                  {active.topics.map((topic, i) => (
                    <TopicCard
                      key={i}
                      topic={topic}
                      color={active.color}
                      light={active.light}
                      border={active.border}
                      index={i}
                    />
                  ))}

                  {/* Prev / Next */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
                    {activeIdx > 0 ? (
                      <button onClick={() => setActiveId(SECTIONS[activeIdx - 1].id)} style={{
                        padding: "10px 20px", background: "#fff", color: "#374151",
                        border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer",
                        fontSize: 13.5, fontWeight: "500", display: "flex", alignItems: "center", gap: 8,
                      }}>
                        ← {SECTIONS[activeIdx - 1].label}
                      </button>
                    ) : <div />}

                    {activeIdx < SECTIONS.length - 1 && (
                      <button onClick={() => setActiveId(SECTIONS[activeIdx + 1].id)} style={{
                        padding: "10px 24px", background: active.color, color: "#fff",
                        border: "none", borderRadius: 8, cursor: "pointer",
                        fontSize: 13.5, fontWeight: "700", display: "flex", alignItems: "center", gap: 8,
                      }}>
                        {SECTIONS[activeIdx + 1].label} →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STATUS QUICK REF ──────────────────────────────────────── */}
          {!isSearching && (
            <div style={{ background: "#fff", borderRadius: 12, padding: "22px 24px", marginTop: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#111827", fontSize: 16, fontWeight: "700", borderBottom: "1px solid #f3f4f6", paddingBottom: 12 }}>
                📋 Reservation Status — Quick Reference
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {[
                  { status: "Pending",      desc: "New booking awaiting confirmation",  color: "#856404", bg: "#fff3cd", icon: "⏳" },
                  { status: "Confirmed",    desc: "Payment received, guest expected",    color: "#065f46", bg: "#d1fae5", icon: "✅" },
                  { status: "Checked-In",   desc: "Guest has arrived and checked in",    color: "#1e40af", bg: "#dbeafe", icon: "🏨" },
                  { status: "Checked-Out",  desc: "Guest has departed the resort",       color: "#374151", bg: "#f3f4f6", icon: "🚪" },
                  { status: "Cancelled",    desc: "Booking cancelled, excluded from income", color: "#991b1b", bg: "#fee2e2", icon: "❌" },
                ].map(s => (
                  <div key={s.status} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: "700", color: s.color, marginBottom: 4 }}>{s.status}</div>
                    <div style={{ fontSize: 11.5, color: s.color, opacity: 0.85, lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Help;