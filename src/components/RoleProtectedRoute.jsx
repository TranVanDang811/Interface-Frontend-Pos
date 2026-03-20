import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Kiểm tra role
  const userRoles = user?.roles?.map(r => r.name) || [];
  const hasAccess = userRoles.some(r => allowedRoles.includes(r));

  if (!hasAccess) {
    // Không có quyền truy cập -> redirect về trang phù hợp với role
    const role = userRoles[0];
    return <Navigate to={role === "ADMIN" ? "/dashboard/home" : "/pos"} replace />;
  }

  return children;
}