import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dashboard, Auth } from "@/layouts";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { restoreSession } from "./features/auth/authThunks";
import POS from "./layouts/pos";
import GlobalAlert from "./utils/GlobalAlert";
import PaymentPage from "./pages/pos/PaymentPage";
import PosManage from "./pages/pos/PosManage";
import AddCustomerPos from "./pages/pos/AddCustomerPos";
import SettlementPos from "./pages/pos/SettlementPos";
import OpenShift from "./pages/pos/OpenShift";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, sessionRestored, loading } = useSelector((state) => state.auth);

  // Khôi phục session khi app load
  useEffect(() => {
    if (!sessionRestored) {
      dispatch(restoreSession());
    }
  }, [dispatch, sessionRestored]);

  // Loading khi đang check session
  if (!sessionRestored || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> chỉ cho vào /auth
  if (!isAuthenticated) {
    return (
      <>
      <GlobalAlert />
      <Routes>
        <Route path="/auth/*" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
      </>
        
    );
  }

  // Đã đăng nhập
  const role = user?.roles?.[0]?.name;

  const dashboardRoles = ["ADMIN", "MANAGE"];

  const defaultRoute = dashboardRoles.includes(role)
    ? "/dashboard/home"
    : "/pos";

  return (
    <>
    <GlobalAlert />
    <Routes>

      {/* Redirect /auth nếu đã login */}
<Route path="/auth/*" element={<Auth />} />
      {/* ADMIN Dashboard */}
      <Route
        path="/dashboard/*"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGE"]}>
            <Dashboard />
          </RoleProtectedRoute>
        }
      />

      {/* POS Page */}
      <Route
        path="/pos"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN","MANAGE", "EMPLOYEE"]}>
            <POS />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/pos/payment"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN","MANAGE","EMPLOYEE"]}>
            <PaymentPage />
          </RoleProtectedRoute>
        }
      />
      
      <Route path="/pos/open-shift" element={<OpenShift />} />
      <Route path="/pos/manage" element={<PosManage />} />
      <Route path="/pos/add/customer" element={<AddCustomerPos />} />
      <Route path="/pos/settlement" element={<SettlementPos />} />
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      {/* 404 redirect */}
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
    </>
  );
}

export default App;