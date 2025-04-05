import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/PromotionEnded";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import CreateQRCode from "../pages/CreateQRCode";
import UpdateQRCode from "../pages/UpdateQRCode";

// Import the ProtectedRoute
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public route(s) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create"
          element={
            <ProtectedRoute>
              <CreateQRCode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/update"
          element={
            <ProtectedRoute>
              <UpdateQRCode />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
