import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCategory } from "@/features/category/categoryThunks";
import { useNavigate } from "react-router-dom";

export default function AddCategory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.category);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      alert("Vui lòng nhập tên category");
      return;
    }

    const resultAction = await dispatch(createCategory(form));

    if (createCategory.fulfilled.match(resultAction)) {
      alert("Thêm category thành công");
      navigate("/dashboard/categories");
    } else {
      alert("Thêm category thất bại");
    }
  };

  return (
    <div className="mt-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardBody className="flex flex-col gap-4">
          <Typography variant="h5">Add Category</Typography>

          <Input
            label="Category Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <Button onClick={handleSubmit} color="blue" disabled={loading}>
            {loading ? "Đang thêm category..." : "Create Category"}
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}