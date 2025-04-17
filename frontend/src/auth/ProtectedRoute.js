import { Navigate } from "react-router-dom";
import { getRole, getToken } from "./auth";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const role = getRole();

  if (!token || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace/>;
  }

  return children;
};
