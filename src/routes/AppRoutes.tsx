import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import MyRequestsPage from "../pages/MyRequestsPage";
import QueuePage from "../pages/QueuePage";
import NewRequestPage from "../pages/NewRequestPage";
import RequestDetailPage from "../pages/RequestDetailPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/my-requests" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/my-requests" element={<MyRequestsPage />} />

        <Route path="/queue" element={<QueuePage />} />

        <Route path="/requests/new" element={<NewRequestPage />} />

        <Route
          path="/requests/:id"
          element={<RequestDetailPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;