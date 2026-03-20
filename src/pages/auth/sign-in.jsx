import React, { useState, useEffect } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { login } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import { showAlert } from "@/features/alert/alertSlice";

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

  // 👉 xử lý sau login
  useEffect(() => {
    const handleAfterLogin = async () => {
      if (!isAuthenticated || !user) return;

      const role = user?.roles?.[0]?.name;

      // ✅ ADMIN không cần shift
      if (role === "ADMIN" || role === "MANAGE") {
        navigate("/dashboard/home", { replace: true });
        return;
      }

      setCheckingShift(true);

      try {
  

       const res = await dispatch(fetchCurrentShift());

if (fetchCurrentShift.rejected.match(res)) {
  throw new Error(res.payload?.message || "Lỗi hệ thống");
}

const shift = res.payload?.result;

// ✅ FIX: check shift null
if (!shift || !shift.shiftCode) {
  localStorage.removeItem("shiftCode");
  navigate("/pos/open-shift");
  return;
}

localStorage.setItem("shiftCode", shift.shiftCode);
navigate("/pos", { replace: true });

      } catch (e) {
        dispatch(
          showAlert({
            type: "red",
            message: e.message || "Lỗi hệ thống",
          })
        );

        // 👉 reset auth
        localStorage.removeItem("token");
        localStorage.removeItem("shiftCode");

        window.location.reload();
      } finally {
        setCheckingShift(false);
      }
    };

    handleAfterLogin();
  }, [isAuthenticated, user, dispatch, navigate]);

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

    // 👉 lưu username
    localStorage.setItem("lastUsername", username);

    const result = await dispatch(login({ username, password }));

    // ❌ login fail
    if (login.rejected.match(result)) {
      dispatch(
        showAlert({
          type: "red",
          message:
            result.payload?.message || "Sai tài khoản hoặc mật khẩu",
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

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <Typography variant="h3" className="font-bold uppercase">
            Log in to the system
          </Typography>
        </div>

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
              placeholder="username"
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