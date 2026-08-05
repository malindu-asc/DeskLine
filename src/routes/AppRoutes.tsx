import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import MyRequestsPage from "../pages/MyRequestsPage";
import QueuePage from "../pages/QueuePage";
import NewRequestPage from "../pages/NewRequestPage";
import RequestDetailPage from "../pages/RequestDetailPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import RoleRoute from "../features/auth/components/RoleRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/my-requests" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <RoleRoute allow={["requester"]}>
                <MyRequestsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue"
          element={
            <ProtectedRoute>
              <RoleRoute allow={["technician", "admin"]}>
                <QueuePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <RoleRoute allow={["requester"]}>
                <NewRequestPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <RequestDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
