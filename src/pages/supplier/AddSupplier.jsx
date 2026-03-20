import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSupplier } from "@/features/supplier/supplierThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { useNavigate } from "react-router-dom";

export default function AddSupplier() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.supplier);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      dispatch(
        showAlert({
          message: "Vui lòng nhập tên nhà cung cấp",
          type: "red",
        })
      );
      return;
    }

    const resultAction = await dispatch(createSupplier(form));

    if (createSupplier.fulfilled.match(resultAction)) {
      dispatch(
        showAlert({
          message: "Thêm nhà cung cấp thành công",
          type: "green",
        })
      );

      navigate("/dashboard/suppliers");
    } else {
      dispatch(
        showAlert({
          message: "Thêm nhà cung cấp thất bại",
          type: "red",
        })
      );
    }
  };

  return (
    <div className="mt-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardBody className="flex flex-col gap-4">
          <Typography variant="h5">Add Supplier</Typography>

          <Input
            label="Supplier Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />


            <Button onClick={handleSubmit} color="blue" disabled={loading}>
              {loading ? "Đang thêm nhà cung cấp..." : "Create Supplier"}
            </Button>

            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
         
        </CardBody>
      </Card>
    </div>
  );
}