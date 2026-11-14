import { Navigate, useLocation } from "react-router-dom";

/**
 * PrivateRoute — Guards a route behind authentication and optional role check.
 * Unauthenticated → redirect to /login (with return path saved in state).
 * Wrong role → redirect to correct dashboard or home.
 */
function PrivateRoute({ children, roles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // Not authenticated at all
  if (!token || !storedUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Parse stored user — handle corrupted data gracefully
  let parsedUser;
  try {
    parsedUser = JSON.parse(storedUser);
  } catch {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access check
  if (roles && roles.length > 0 && !roles.includes(parsedUser.role)) {
    if (parsedUser.role === "SUPER_ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (["HOSPITAL_ADMIN", "HOSPITAL_STAFF"].includes(parsedUser.role)) return <Navigate to="/hospital/dashboard" replace />;
    if (["BLOOD_BANK_ADMIN", "BLOOD_BANK_STAFF"].includes(parsedUser.role)) return <Navigate to="/blood-bank/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;

