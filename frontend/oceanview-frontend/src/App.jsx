import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import AddReservation from "./pages/AddReservation";
import Reports        from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Help           from "./pages/Help";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Login />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/reservations" element={<AddReservation />} />
        <Route path="/reports"      element={<Reports />} />
        <Route path="/users"        element={<UserManagement />} />
        <Route path="/help"         element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;