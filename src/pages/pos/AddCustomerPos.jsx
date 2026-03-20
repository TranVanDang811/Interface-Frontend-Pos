import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "@/features/user/userThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { useNavigate } from "react-router-dom";

export default function AddCustomerPos({ onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
const navigate = useNavigate();
  const [form, setForm] = useState({
     username: "",
    password: "",
    fullName: "",
    phone: "",
    status: "active",
    roles: "CUSTOMER",
    customerProfile: {
      loyaltyPoints: 0,
      membershipLevel: "",
    },
  });

  const phoneRegex = /^[0-9]{9,11}$/;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

    if (form.phone && !phoneRegex.test(form.phone)) {
      dispatch(showAlert({ type: "orange", message: "Số điện thoại không hợp lệ" }));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

   const payload = {
  username: form.username || "",
  password: form.password || "",
  email: "",
  fullName: form.fullName,
  phone: form.phone,
  status: form.status,
  roles: form.roles,

  customerProfile: {
    loyaltyPoints: Number(form.customerProfile.loyaltyPoints) || 0,
    membershipLevel: form.customerProfile.membershipLevel,
  },
};

    const result = await dispatch(createUser(payload));

    if (createUser.fulfilled.match(result)) {
  dispatch(showAlert({ type: "green", message: "Tạo khách hàng thành công" }));

  if (onSuccess) onSuccess(result.payload);

  // 👉 quay lại POS
  navigate("/pos");

  setForm({
    fullName: "",
    phone: "",
    status: "active",
    roles: "CUSTOMER",
    customerProfile: {
      loyaltyPoints: 0,
      membershipLevel: "",
    },
  });
} else {
      dispatch(
        showAlert({
          type: "red",
          message: result.payload?.message || "Tạo khách hàng thất bại",
        })
      );
    }
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <Card className="w-full max-w-3xl shadow-xl rounded-2xl">
        <CardBody className="p-8">

          {/* TITLE */}
          <Typography
            variant="h4"
            className="mb-8 text-center font-bold text-blue-gray-800"
          >
            Add New Customer
          </Typography>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* BASIC INFO */}
            <div>
              <Typography className="mb-4 font-semibold text-gray-700">
                Customer Information
              </Typography>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  required
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />

                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />

                <Select label="Role" value={form.roles} disabled>
                  <Option value="CUSTOMER">CUSTOMER</Option>
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
            </div>

            {/* CUSTOMER PROFILE */}
            <div className="bg-green-50 p-6 rounded-xl">
              <Typography className="mb-4 font-semibold text-green-700">
                Loyalty Information
              </Typography>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Loyalty Points"
                  type="number"
                  value={form.customerProfile.loyaltyPoints}
                  onChange={(e) =>
                    handleCustomerChange("loyaltyPoints", e.target.value)
                  }
                />

                <Input
                  label="Membership Level"
                  value={form.customerProfile.membershipLevel}
                  onChange={(e) =>
                    handleCustomerChange("membershipLevel", e.target.value)
                  }
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex justify-end pt-4 gap-4">
              <Button
                color="blue"
                size="lg"
                type="submit"
                disabled={loading}
                className="rounded-lg"
              >
                {loading ? "Creating..." : "Add Customer"}
              </Button>
                 <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            </div>

          </form>
        </CardBody>
      </Card>
    </div>
  );
}