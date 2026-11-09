import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Kiểm tra role (chuẩn hóa bỏ tiền tố ROLE_ và viết hoa)
  const userRoles =
    user?.roles?.map((r) => {
      const raw = typeof r === "string" ? r : r?.name || "";
      return raw.replace(/^ROLE_/, "").toUpperCase();
    }) || [];
  const normalizedAllowed = (allowedRoles || []).map((a) =>
    a.replace(/^ROLE_/, "").toUpperCase()
  );
  const hasAccess = userRoles.some((r) => normalizedAllowed.includes(r));

  if (!hasAccess) {
    // Không có quyền truy cập -> redirect về trang phù hợp với role
    const isPrivileged = userRoles.some((r) => ["ADMIN", "MANAGE"].includes(r));
    return <Navigate to={isPrivileged ? "/dashboard/home" : "/pos"} replace />;
  }

  return children;
}
