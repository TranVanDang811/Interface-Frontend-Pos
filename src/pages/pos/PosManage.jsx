import React, { useState } from "react";
import { Card, CardBody, Typography, Button, Input } from "@material-tailwind/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authAPI from "@/features/auth/authAPI";
import { logout } from "@/features/auth/authThunks";
import { showAlert } from "@/features/alert/alertSlice";

export default function PosManage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const userRoles = user?.roles?.map((r) => (typeof r === "string" ? r : r.name)?.toUpperCase()) || [];
  const isAdmin = userRoles.some((role) => role === "ADMIN" || role === "MANAGE");

  // State cho Modal đăng nhập Admin/Manage
  const [openModal, setOpenModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleOpenAdminDashboardInNewTab = async (e) => {
    e?.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAuthError("Vui lòng nhập đầy đủ tên tài khoản và mật khẩu");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      // 1. Xác thực thông tin đăng nhập của Admin/Manager
      const loginRes = await authAPI.login({
        username: adminUsername.trim(),
        password: adminPassword,
      });

      const payload = loginRes.result || loginRes;
      const adminToken = payload.token || payload.accessToken;
      const adminRefreshToken = payload.refreshToken;

      if (!adminToken) {
        throw new Error("Không nhận được token xác thực");
      }

      // 2. Kiểm tra quyền của tài khoản từ scope trong JWT
      try {
        const decoded = JSON.parse(atob(adminToken.split(".")[1]));
        const scope = decoded.scope || "";
        const isPrivileged =
          scope.includes("ROLE_ADMIN") ||
          scope.includes("ROLE_MANAGE") ||
          scope.includes("ADMIN") ||
          scope.includes("MANAGE");

        if (!isPrivileged) {
          setAuthError("Tài khoản này không có quyền truy cập Dashboard (cần quyền ADMIN hoặc MANAGE).");
          setAuthLoading(false);
          return;
        }
      } catch (decodeErr) {
        console.warn("Could not decode JWT scope, proceeding:", decodeErr);
      }

      // 3. Đưa token chuyển giao cho tab mới mà không ảnh hưởng tới tab Employee hiện tại
      localStorage.setItem("admin_handoff_token", adminToken);
      if (adminRefreshToken) {
        localStorage.setItem("admin_handoff_refresh", adminRefreshToken);
      }

      // 4. Mở Dashboard trong tab mới
      window.open("/dashboard/home", "_blank");

      dispatch(
        showAlert({
          type: "green",
          message: "Đã mở trang Dashboard quản lý trong tab mới song song với POS!",
        })
      );

      setOpenModal(false);
      setAdminUsername("");
      setAdminPassword("");
    } catch (err) {
      console.error("Admin auth error:", err);
      const msg = err.response?.data?.message || err.message || "Tài khoản hoặc mật khẩu không chính xác";
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const menus = [
    {
      title: "Quay lại POS bán hàng",
      desc: "Trở về màn hình tạo đơn và thu ngân",
      color: "bg-blue-600 text-white",
      action: () => navigate("/pos"),
    },
    {
      title: "In lại hóa đơn",
      desc: "Xem và in lại các đơn hàng đã thanh toán",
      color: "bg-white text-gray-800",
      action: () => navigate("/pos/reprint"),
    },
    {
      title: "Kết toán ca làm việc",
      desc: "Kiểm đếm tiền và đóng ca bán hàng",
      color: "bg-white text-gray-800",
      action: () => navigate("/pos/settlement"),
    },
    {
      title: "Đổi mật khẩu",
      desc: "Thay đổi mật khẩu tài khoản hiện tại",
      color: "bg-white text-gray-800",
      action: () => navigate("/auth/change-password"),
    },

    // Nếu đã là Admin/Manage
    ...(isAdmin
      ? [
          {
            title: "Trang Dashboard Quản Trị",
            desc: "Xem thống kê, doanh thu, hàng hóa, nhân sự",
            color: "bg-indigo-600 text-white",
            action: () => navigate("/dashboard/home"),
          },
          {
            title: "Mở Dashboard trong Tab Mới",
            desc: "Giữ màn hình POS này và mở Dashboard ở tab khác",
            color: "bg-purple-600 text-white",
            action: () => window.open("/dashboard/home", "_blank"),
          },
        ]
      : [
          // Nếu đang là Employee: cho phép Admin/Manage đăng nhập mở Dashboard song song
          {
            title: "Đăng nhập Dashboard (Admin / Manage)",
            desc: "Mở trang quản trị song song mà không cần đăng xuất thu ngân",
            color: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
            action: () => {
              setAuthError("");
              setOpenModal(true);
            },
          },
        ]),

    {
      title: "Đăng xuất tài khoản",
      desc: "Thoát phiên làm việc của nhân viên này",
      color: "bg-red-50 text-red-600 border border-red-200",
      action: () => {
        dispatch(logout());
        navigate("/auth/sign-in");
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Typography variant="h3" className="font-bold text-gray-800">
            Quản Lý Điểm Bán (POS)
          </Typography>
          <Typography className="text-gray-600 mt-2">
            Đang đăng nhập: <strong>{user?.fullName || user?.username}</strong> ({userRoles.join(", ")})
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menus.map((item, index) => (
            <Card
              key={index}
              onClick={item.action}
              className={`cursor-pointer hover:shadow-xl hover:scale-[1.02] transition duration-200 rounded-2xl ${item.color}`}
            >
              <CardBody className="p-6">
                <Typography variant="h5" className="font-bold mb-1">
                  {item.title}
                </Typography>
                <Typography variant="small" className="opacity-80">
                  {item.desc}
                </Typography>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal đăng nhập Admin / Manage song song */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <Typography variant="h5" className="font-bold text-gray-900">
                Đăng nhập Admin / Quản Lý
              </Typography>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600 bg-purple-50 p-3 rounded-xl border border-purple-100">
              Nhập tài khoản <strong>Admin</strong> hoặc <strong>Quản lý</strong> để mở trang Dashboard trong tab mới. Phiên bán hàng của thu ngân hiện tại sẽ <strong>hoàn toàn được giữ nguyên</strong>.
            </div>

            {authError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {authError}
              </div>
            )}

            <form onSubmit={handleOpenAdminDashboardInNewTab} className="space-y-4">
              <div>
                <Typography variant="small" className="font-semibold text-gray-700 mb-1">
                  Tài khoản Admin / Manage
                </Typography>
                <Input
                  autoFocus
                  placeholder="admin hoặc manager..."
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  disabled={authLoading}
                />
              </div>

              <div>
                <Typography variant="small" className="font-semibold text-gray-700 mb-1">
                  Mật khẩu
                </Typography>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={authLoading}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outlined"
                  color="gray"
                  className="flex-1"
                  onClick={() => setOpenModal(false)}
                  disabled={authLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  color="purple"
                  className="flex-1"
                  disabled={authLoading}
                >
                  {authLoading ? "Đang xác thực..." : "Mở Dashboard Tab Mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
