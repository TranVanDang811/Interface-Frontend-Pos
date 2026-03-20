import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDiscount } from "@/features/discount/discountThunks";
import { useNavigate } from "react-router-dom";

export default function AddDiscount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.discount);

  const [form, setForm] = useState({
    name: "",
    value: "",
    startDate: "",
    endDate: "",
    active: true,
    code: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      alert("Vui lòng nhập tên discount");
      return;
    }

    const discountData = {
      ...form,
      value: Number(form.value),
    };

    const resultAction = await dispatch(createDiscount(discountData));

    if (createDiscount.fulfilled.match(resultAction)) {
      alert("Thêm discount thành công");
      navigate("/dashboard/discounts");
    } else {
      alert("Thêm discount thất bại");
    }
  };

  return (
    <div className="mt-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardBody className="flex flex-col gap-4">
          <Typography variant="h5">Add Discount</Typography>

          <Input
            label="Discount Code"
            name="code"
            value={form.code}
            onChange={handleChange}
          />

          <Input
            label="Discount Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Value (%)"
            name="value"
            type="number"
            value={form.value}
            onChange={handleChange}
          />

          <Input
            label="Start Date"
            name="startDate"
            type="datetime-local"
            value={form.startDate}
            onChange={handleChange}
          />

          <Input
            label="End Date"
            name="endDate"
            type="datetime-local"
            value={form.endDate}
            onChange={handleChange}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            Active
          </label>

          <Button onClick={handleSubmit} color="blue" disabled={loading}>
            {loading ? "Đang thêm discount..." : "Create Discount"}
          </Button>

          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}