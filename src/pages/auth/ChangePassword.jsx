import React, { useEffect, useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/features/alert/alertSlice";
import { changePassword, fetchMyInfo } from "@/features/user/userThunks";
import { logout } from "@/features/auth/authThunks";

export function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, currentUser } = useSelector((state) => state.user);


  useEffect (() => {
  if (!currentUser) {
    dispatch(fetchMyInfo());
  }
}, [dispatch, currentUser]);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
console.log(currentUser);

  const handleChange = (field) => (e) => {
    setForm({
      ...form,
      [field]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword.trim()) {
      dispatch(
        showAlert({
          type: "red",
          message: "Current password is required",
        })
      );
      return;
    }

    if (!newPassword.trim()) {
      dispatch(
        showAlert({
          type: "red",
          message: "New password is required",
        })
      );
      return;
    }

    if (newPassword.length < 6) {
      dispatch(
        showAlert({
          type: "red",
          message: "New password must be at least 6 characters",
        })
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      dispatch(
        showAlert({
          type: "red",
          message: "Passwords do not match",
        })
      );
      return;
    }

    if (!currentUser?.id) {
      dispatch(
        showAlert({
          type: "red",
          message: "User not found",
        })
      );
      return;
    }

    const result = await dispatch(
      changePassword({
        id: currentUser.id,
        data: {
          oldPassword,
          newPassword,
        },
      })
    );

        if (changePassword.fulfilled.match(result)) {
        dispatch(
          showAlert({
            type: "green",
            message: "Password changed successfully. Please login again.",
          })
        );

        setForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // logout
        dispatch(logout());

        // xóa localStorage nếu chưa xử lý trong logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // quay về login
        navigate("/auth/sign-in");
      }

    if (changePassword.rejected.match(result)) {
      dispatch(
        showAlert({
          type: "red",
          message: result.payload?.message || "Change password failed",
        })
      );
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <Typography variant="h3" className="font-bold uppercase">
            Change Password
          </Typography>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* OLD PASSWORD */}
          <div>
            <Typography variant="small" className="mb-2 font-medium">
              Current Password
            </Typography>

            <Input
              type="password"
              size="lg"
              value={form.oldPassword}
              onChange={handleChange("oldPassword")}
              placeholder="Current password"
              disabled={loading}
            />
          </div>

          {/* NEW PASSWORD */}
          <div>
            <Typography variant="small" className="mb-2 font-medium">
              New Password
            </Typography>

            <Input
              type="password"
              size="lg"
              value={form.newPassword}
              onChange={handleChange("newPassword")}
              placeholder="New password"
              disabled={loading}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <Typography variant="small" className="mb-2 font-medium">
              Confirm Password
            </Typography>

            <Input
              type="password"
              size="lg"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default ChangePassword;