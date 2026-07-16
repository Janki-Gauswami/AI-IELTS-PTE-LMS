import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({
  children,
  allowedRoles = [],
}) => {

  const {
    user,
    loading,
  } = useAuth();

  const location = useLocation();

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">

        <div className="text-center">

          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

          <h2 className="text-lg font-semibold text-slate-700">
            Verifying authentication...
          </h2>

        </div>

      </div>
    );
  }

  // =====================================
  // Not Logged In
  // =====================================

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // =====================================
  // Role Check
  // =====================================

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  // =====================================
  // Authorized
  // =====================================

  return children;
};

export default PrivateRoute;