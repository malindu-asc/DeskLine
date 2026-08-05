import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { getHomeRoute } from "../utils/getHomeRoute";
import type { UserRole } from "../../../shared/types";

interface RoleRouteProps {
  allow: UserRole[];
  children: ReactNode;
}

// Re-checks auth (not just role) so this stays safe even if used without
// being nested inside ProtectedRoute — cheap, and defense in depth.
function RoleRoute({ allow, children }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }

  return children;
}

export default RoleRoute;
