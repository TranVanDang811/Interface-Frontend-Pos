import React, { useState, useEffect } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { login, logout } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import { showAlert } from "@/features/alert/alertSlice";
import { clearTokens } from "@/services/axiosInstance";
import { fetchCurrentShift } from "@/features/shift/shiftThunks";

export function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checkingShift, setCheckingShift] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // 👉 Load username đã lưu
  useEffect(() => {
    const saved = localStorage.getItem("lastUsername");
    if (saved) setUsername(saved);
  }, []);

  // 👉 clear error khi unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // 👉 xử lý điều hướng sau khi login thành công
  useEffect(() => {
    const handleAfterLogin = async () => {
      if (!isAuthenticated || !user) return;

      const userRoles = user?.roles?.map((r) => (typeof r === "string" ? r : r.name)?.toUpperCase()) || [];
      const hasDashboardAccess = userRoles.some((r) => ["ADMIN", "MANAGE"].includes(r));

      // ✅ ADMIN hoặc MANAGE -> vào thẳng Dashboard, hoàn toàn độc lập và không cần ca bán hàng
      if (hasDashboardAccess) {
        navigate("/dashboard/home", { replace: true });
        return;
      }

      // 👉 EMPLOYEE -> kiểm tra ca bán hàng (shift)
      setCheckingShift(true);

      try {
        const res = await dispatch(fetchCurrentShift());

        if (fetchCurrentShift.rejected.match(res)) {
          throw new Error(res.payload?.message || "Lỗi hệ thống");
        }

        const shift = res.payload;

        // Nếu chưa có ca mở -> chuyển sang màn hình mở ca
        if (!shift || !shift.shiftCode) {
          sessionStorage.removeItem("shiftCode");
          navigate("/pos/open-shift", { replace: true });
          return;
        }

        sessionStorage.setItem("shiftCode", shift.shiftCode);
        navigate("/pos", { replace: true });

      } catch (e) {
        dispatch(
          showAlert({
            type: "red",
            message: e.message || "Lỗi hệ thống ca làm việc",
          })
        );

        // Reset auth khi lỗi nghiêm trọng
        clearTokens();
        sessionStorage.removeItem("shiftCode");
        window.location.reload();
      } finally {
        setCheckingShift(false);
      }
    };

    // Chỉ tự động điều hướng nếu vừa submit login, hoặc nếu đã login và người dùng chưa có session trên trang này
    if (justSubmitted) {
      handleAfterLogin();
    }
  }, [isAuthenticated, user, justSubmitted, dispatch, navigate]);

  // 👉 submit login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!username.trim()) {
      dispatch(
        showAlert({
          type: "red",
          message: "Username is required",
        })
      );
      return;
    }

    if (!password.trim()) {
      dispatch(
        showAlert({
          type: "red",
          message: "Password is required",
        })
      );
      return;
    }

    if (password.length < 6) {
      dispatch(
        showAlert({
          type: "red",
          message: "Password must be at least 6 characters",
        })
      );
      return;
    }

    // 👉 lưu username gợi nhớ
    localStorage.setItem("lastUsername", username);

    const result = await dispatch(login({ username: username.trim(), password }));

    if (login.fulfilled.match(result)) {
      setJustSubmitted(true);
    } else if (login.rejected.match(result)) {
      dispatch(
        showAlert({
          type: "red",
          message: result.payload?.message || result.payload || "Sai tài khoản hoặc mật khẩu",
        })
      );
    }
  };

  // 👉 loading check shift
  if (checkingShift) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Typography variant="h5">
          Đang kiểm tra ca làm việc...
        </Typography>
      </div>
    );
  }

  const userRoles = user?.roles?.map((r) => (typeof r === "string" ? r : r.name)?.toUpperCase()) || [];
  const hasDashboardAccess = userRoles.some((r) => ["ADMIN", "MANAGE"].includes(r));

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <Typography variant="h3" className="font-bold uppercase">
            Log in to the system
          </Typography>
          <Typography variant="small" className="text-gray-500 mt-1">
            Đăng nhập để vào hệ thống POS hoặc Dashboard
          </Typography>
        </div>

        {/* Thông báo nếu tab hiện tại đã có tài khoản đang đăng nhập */}
        {isAuthenticated && user && !justSubmitted && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900 flex flex-col gap-3">
            <div>
              Tab này đang đăng nhập: <strong className="text-blue-700">{user.username}</strong> ({userRoles.join(", ")})
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="blue"
                className="flex-1"
                onClick={() => navigate(hasDashboardAccess ? "/dashboard/home" : "/pos")}
              >
                Tiếp tục phiên này
              </Button>
              <Button
                size="sm"
                variant="outlined"
                color="red"
                onClick={() => dispatch(logout())}
              >
                Đăng xuất
              </Button>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Hoặc nhập tài khoản khác (Admin/Manager/Employee) bên dưới để chuyển đổi trên tab này:
            </div>
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-medium"
            >
              Your username
            </Typography>

            <Input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="lg"
              placeholder="admin, manager01, staff01..."
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-medium"
            >
              Password
            </Typography>

            <Input
              type="password"
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              disabled={loading}
            />
          </div>

          {/* Button */}
          <Button type="submit" className="mt-4" fullWidth disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default SignIn;
