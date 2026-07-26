import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Skeleton } from "../ui/skeleton";

const ProtectedRoute = ({ children, roles, excludeRoles }) => {
  const { user, loading, isAuthenticated, hasAnyRole } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 w-64">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (excludeRoles && excludeRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;