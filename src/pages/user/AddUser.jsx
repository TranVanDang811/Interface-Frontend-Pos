import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUser } from "@/features/user/userThunks";
import { fetchRoles } from "@/features/role/roleThunks";
import { hideAlert, showAlert } from "@/features/alert/alertSlice";

export default function AddUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.user);
  const { list: roles } = useSelector((state) => state.role);
  const { open } = useSelector((state) => state.alert);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    roles: "",
    status: "active",

    employeeProfile: {
      position: "",
      salary: "",
      hireDate: "",
      shift: "",
    },

    customerProfile: {
      loyaltyPoints: "",
      membershipLevel: "",
    },
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{9,11}$/;

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, size: 100 }));
  }, [dispatch]);

  // Auto hide alert
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => dispatch(hideAlert()), 3000);
      return () => clearTimeout(timer);
    }
  }, [open, dispatch]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      employeeProfile: { ...prev.employeeProfile, [field]: value },
    }));
  };

  const handleCustomerChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      customerProfile: { ...prev.customerProfile, [field]: value },
    }));
  };

  const validateForm = () => {
    if (!form.fullName || form.fullName.trim().length < 3) {
      dispatch(showAlert({ type: "orange", message: "Full name ≥ 3 ký tự" }));
      return false;
    }

    if (!form.username || form.username.length < 4) {
      dispatch(showAlert({ type: "orange", message: "Username ≥ 4 ký tự" }));
      return false;
    }

    if (form.username.includes(" ")) {
      dispatch(showAlert({ type: "orange", message: "Username không được có khoảng trắng" }));
      return false;
    }

    if (!emailRegex.test(form.email)) {
      dispatch(showAlert({ type: "orange", message: "Email không hợp lệ" }));
      return false;
    }

    if (form.phone && !phoneRegex.test(form.phone)) {
      dispatch(showAlert({ type: "orange", message: "Số điện thoại không hợp lệ" }));
      return false;
    }

    if (!form.password || form.password.length < 6) {
      dispatch(showAlert({ type: "orange", message: "Password ≥ 6 ký tự" }));
      return false;
    }

    if (!form.roles) {
      dispatch(showAlert({ type: "orange", message: "Vui lòng chọn role" }));
      return false;
    }

    if (["EMPLOYEE", "MANAGE"].includes(form.roles)) {
      if (form.employeeProfile.salary && Number(form.employeeProfile.salary) < 0) {
        dispatch(showAlert({ type: "orange", message: "Salary không hợp lệ" }));
        return false;
      }

      if (form.employeeProfile.hireDate) {
        const hireDate = new Date(form.employeeProfile.hireDate);
        if (hireDate > new Date()) {
          dispatch(showAlert({ type: "orange", message: "Hire date không hợp lệ" }));
          return false;
        }
      }
    }

    if (form.roles === "CUSTOMER") {
      if (
        form.customerProfile.loyaltyPoints &&
        Number(form.customerProfile.loyaltyPoints) < 0
      ) {
        dispatch(showAlert({ type: "orange", message: "Loyalty points ≥ 0" }));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      username: form.username,
      password: form.password,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      roles: form.roles,
      status: form.status,
    };

    if (["EMPLOYEE", "MANAGE"].includes(form.roles)) {
      payload.employeeProfile = {
        ...form.employeeProfile,
        salary: form.employeeProfile.salary
          ? Number(form.employeeProfile.salary)
          : null,
      };
    }

    if (form.roles === "CUSTOMER") {
      payload.customerProfile = {
        ...form.customerProfile,
        loyaltyPoints: form.customerProfile.loyaltyPoints
          ? Number(form.customerProfile.loyaltyPoints)
          : 0,
      };
    }

    const result = await dispatch(createUser(payload));

    if (createUser.fulfilled.match(result)) {
      dispatch(showAlert({ type: "green", message: "Tạo user thành công" }));
      navigate("/dashboard/users");
    } else {
      dispatch(
        showAlert({
          type: "red",
          message: result.payload?.message || "Tạo user thất bại",
        })
      );
    }
  };

  return (
    <div className="mt-12 mb-8 flex justify-center px-4">
      <Card className="w-full max-w-5xl shadow-2xl rounded-2xl">
        <CardBody className="p-10">
          <Typography variant="h4" className="mb-10 font-bold text-center">
            Create New User
          </Typography>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ===== BASIC INFO ===== */}
            <div>
              <Typography className="mb-4 font-semibold text-gray-700">
                Basic Information
              </Typography>

              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Full Name" required
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                <Input label="Username" required
                  onChange={(e) => handleChange("username", e.target.value)}
                />
                <Input label="Email" type="email" required
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <Input label="Phone"
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <Input label="Password" type="password" required
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </div>
            </div>

            {/* ===== ROLE & STATUS ===== */}
            <div className="grid md:grid-cols-2 gap-6">
              <Select
                label="Role"
                value={form.roles}
                onChange={(val) => handleChange("roles", val)}
              >
                {roles.map((role) => (
                  <Option key={role.name} value={role.name}>
                    {role.name}
                  </Option>
                ))}
              </Select>

              <Select
                label="Status"
                value={form.status}
                onChange={(val) => handleChange("status", val)}
              >
                <Option value="active">ACTIVE</Option>
                <Option value="inactive">INACTIVE</Option>
              </Select>
            </div>

            {/* ===== EMPLOYEE PROFILE ===== */}
            {(form.roles === "EMPLOYEE" || form.roles === "MANAGE") && (
              <div className="bg-blue-50 p-6 rounded-xl space-y-6">
                <Typography className="font-semibold text-blue-700">
                  Employee Profile
                </Typography>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Position"
                    onChange={(e) =>
                      handleEmployeeChange("position", e.target.value)
                    }
                  />
                  <Input label="Salary" type="number"
                    onChange={(e) =>
                      handleEmployeeChange("salary", e.target.value)
                    }
                  />
                  <Input label="Hire Date" type="date"
                    onChange={(e) =>
                      handleEmployeeChange("hireDate", e.target.value)
                    }
                  />
                  <Input label="Shift"
                    onChange={(e) =>
                      handleEmployeeChange("shift", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {/* ===== CUSTOMER PROFILE ===== */}
            {form.roles === "CUSTOMER" && (
              <div className="bg-green-50 p-6 rounded-xl space-y-6">
                <Typography className="font-semibold text-green-700">
                  Customer Profile
                </Typography>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Loyalty Points" type="number"
                    onChange={(e) =>
                      handleCustomerChange("loyaltyPoints", e.target.value)
                    }
                  />
                  <Input label="Membership Level"
                    onChange={(e) =>
                      handleCustomerChange("membershipLevel", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {/* ===== BUTTON ===== */}
            <div className="flex justify-end gap-4 pt-6">
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Cancel
              </Button>

              <Button color="blue" type="submit" disabled={loading}>
                {loading ? "Đang tạo..." : "Create User"}
              </Button>
            </div>

          </form>
        </CardBody>
      </Card>
    </div>
  );
}