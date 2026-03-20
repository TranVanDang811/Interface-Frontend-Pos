import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "@/features/product/productThunks";
import { fetchCategories } from "@/features/category/categoryThunks";
import { fetchSuppliers } from "@/features/supplier/supplierThunks";
import { showAlert } from "@/features/alert/alertSlice";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: categories } = useSelector((state) => state.category);
  const { list: suppliers } = useSelector((state) => state.supplier);
  const { loading } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, size: 100 }));
    dispatch(fetchSuppliers({ page: 1, size: 100 }));
  }, [dispatch]);

  const [form, setForm] = useState({
    productCode: "",
    name: "",
    price: "",
    cost: "",
    unit: "",
    stock: "",
    categoryName: "",
    supplierName: "",
    status: "",
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  if (!form.categoryName) {
    dispatch(
      showAlert({
        message: "Vui lòng chọn category",
        type: "red",
      })
    );
    return;
  }

  if (!form.supplierName) {
    dispatch(
      showAlert({
        message: "Vui lòng chọn supplier",
        type: "red",
      })
    );
    return;
  }

  const productData = {
    ...form,
    price: Number(form.price),
    cost: Number(form.cost),
    stock: Number(form.stock),
  };

  const resultAction = await dispatch(
    createProduct({ product: productData, image })
  );

  if (createProduct.fulfilled.match(resultAction)) {
    dispatch(
      showAlert({
        message: "Thêm sản phẩm thành công",
        type: "green",
      })
    );

    navigate("/dashboard/products");

  } else {

    const errorMessage =
      resultAction.payload?.message || "Product code đã tồn tại";

    dispatch(
      showAlert({
        message: errorMessage,
        type: "red",
      })
    );
  }
};

  return (
    <div className="mt-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardBody className="flex flex-col gap-4">
          <Typography variant="h5">Add Product</Typography>

          <Input label="Product Code" name="productCode" onChange={handleChange} />
          <Input label="Name" name="name" onChange={handleChange} />
          <Input label="Price" name="price" type="number" onChange={handleChange} />
          <Input label="Cost" name="cost" type="number" onChange={handleChange} />
          <Input label="Unit" name="unit" onChange={handleChange} />
          <Input label="Stock" name="stock" type="number" onChange={handleChange} />

          <select
            name="categoryName"
            className="border rounded-md p-2"
            onChange={handleChange}
            value={form.categoryName}
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="supplierName"
            className="border rounded-md p-2"
            onChange={handleChange}
            value={form.supplierName}
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <input type="file" onChange={(e) => setImage(e.target.files[0])} />

          <select
            name="status"
            className="border rounded-md p-2"
            onChange={handleChange}
            value={form.status}
          >
            <option value="">-- Select Status --</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DISCONTINUED">DISCONTINUED</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
          </select>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} color="blue" disabled={loading}>
              {loading ? "Đang thêm sản phẩm..." : "Create Product"}
            </Button>

            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}