import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { restoreSession } from "./features/auth/authThunks";
import GlobalAlert from "./utils/GlobalAlert";

// Code splitting / Lazy Loading
const Dashboard = lazy(() => import("@/layouts/dashboard"));
const Auth = lazy(() => import("@/layouts/auth"));
const POS = lazy(() => import("@/layouts/pos"));
const PaymentPage = lazy(() => import("@/pages/pos/PaymentPage"));
const PosManage = lazy(() => import("@/pages/pos/PosManage"));
const AddCustomerPos = lazy(() => import("@/pages/pos/AddCustomerPos"));
const SettlementPos = lazy(() => import("@/pages/pos/SettlementPos"));
const OpenShift = lazy(() => import("@/pages/pos/OpenShift"));
const ReprintPos = lazy(() => import("@/pages/pos/ReprintPos"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Đang tải...</p>
    </div>
  </div>
);

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
    return <LoadingFallback />;
  }

  // Chưa đăng nhập -> chỉ cho vào /auth
  if (!isAuthenticated) {
    return (
      <>
        <GlobalAlert />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/auth/*" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  // Đã đăng nhập
  const userRoleNames = user?.roles?.map((r) => (typeof r === "string" ? r : r.name)?.toUpperCase()) || [];
  const dashboardRoles = ["ADMIN", "MANAGE"];
  const hasDashboardAccess = userRoleNames.some((r) => dashboardRoles.includes(r));

  const defaultRoute = hasDashboardAccess
    ? "/dashboard/home"
    : "/pos";

  return (
    <>
      <GlobalAlert />
      <Suspense fallback={<LoadingFallback />}>
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
              <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGE", "EMPLOYEE"]}>
                <POS />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/pos/payment"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGE", "EMPLOYEE"]}>
                <PaymentPage />
              </RoleProtectedRoute>
            }
          />
          
          <Route
            path="/pos/open-shift"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGE", "EMPLOYEE"]}>
                <OpenShift />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/pos/manage"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGE", "EMPLOYEE"]}>
                <PosManage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/pos/add/customer"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGE", "EMPLOYEE"]}>
                <AddCustomerPos />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/pos/settlement"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGE", "EMPLOYEE"]}>
                <SettlementPos />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/pos/reprint"
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGE", "EMPLOYEE"]}>
                <ReprintPos />
              </RoleProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to={defaultRoute} replace />} />

          {/* 404 redirect */}
          <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
