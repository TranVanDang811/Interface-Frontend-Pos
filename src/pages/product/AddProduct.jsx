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
    stock: "0",
    categoryName: "",
    supplierName: "",
    status: "OUT_OF_STOCK",
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "stock") {
      const numStock = Number(value);
      setForm((prev) => ({
        ...prev,
        stock: value,
        status: numStock <= 0 ? "OUT_OF_STOCK" : prev.status === "OUT_OF_STOCK" ? "ACTIVE" : prev.status,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.productCode.trim()) {
      dispatch(
        showAlert({
          message: "Vui lòng nhập mã sản phẩm",
          type: "red",
        })
      );
      return;
    }

    if (!form.name.trim()) {
      dispatch(
        showAlert({
          message: "Vui lòng nhập tên sản phẩm",
          type: "red",
        })
      );
      return;
    }

    if (!form.categoryName) {
      dispatch(
        showAlert({
          message: "Vui lòng chọn danh mục",
          type: "red",
        })
      );
      return;
    }

    if (!form.supplierName) {
      dispatch(
        showAlert({
          message: "Vui lòng chọn nhà cung cấp",
          type: "red",
        })
      );
      return;
    }

    const numStock = Number(form.stock) || 0;
    let finalStatus = form.status;
    if (numStock <= 0) {
      finalStatus = "OUT_OF_STOCK";
    } else if (!finalStatus || finalStatus === "OUT_OF_STOCK") {
      finalStatus = "ACTIVE";
    }

    const productData = {
      ...form,
      price: Number(form.price) || 0,
      cost: form.cost !== "" ? Number(form.cost) : 0,
      stock: numStock,
      status: finalStatus,
    };

    const resultAction = await dispatch(
      createProduct({ product: productData, image })
    );

    if (createProduct.fulfilled.match(resultAction)) {
      dispatch(
        showAlert({
          message: "Thêm sản phẩm thành công!",
          type: "green",
        })
      );
      navigate("/dashboard/products");
    } else {
      const errorMessage =
        resultAction.payload?.message || "Mã sản phẩm đã tồn tại trong hệ thống";
      dispatch(
        showAlert({
          message: errorMessage,
          type: "red",
        })
      );
    }
  };

  return (
    <div className="mt-8 flex justify-center pb-12">
      <Card className="w-full max-w-2xl border border-blue-gray-100 shadow-lg">
        <CardBody className="flex flex-col gap-5 p-6">
          <div className="border-b pb-3">
            <Typography variant="h5" className="font-bold text-gray-900">
              Thêm Mới Sản Phẩm (Add Product)
            </Typography>
            <Typography variant="small" className="text-gray-500 text-xs mt-0.5">
              Nhập thông tin sản phẩm mới để quản lý và bán hàng tại quầy POS
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Mã sản phẩm *"
                name="productCode"
                value={form.productCode}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Tên sản phẩm *"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Giá bán (VND) *"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Giá vốn ban đầu (VND)"
                name="cost"
                type="number"
                min="0"
                value={form.cost}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Đơn vị tính (ly, cái, kg...)"
                name="unit"
                value={form.unit}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Số lượng tồn kho ban đầu"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                name="categoryName"
                className="w-full border rounded-lg p-2.5 text-sm focus:outline-blue-500 bg-white"
                onChange={handleChange}
                value={form.categoryName}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nhà cung cấp *
              </label>
              <select
                name="supplierName"
                className="w-full border rounded-lg p-2.5 text-sm focus:outline-blue-500 bg-white"
                onChange={handleChange}
                value={form.supplierName}
              >
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map((s) => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ảnh đại diện sản phẩm
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Trạng thái sản phẩm
            </label>
            <select
              name="status"
              className="w-full border rounded-lg p-2.5 text-sm focus:outline-blue-500 bg-white"
              onChange={handleChange}
              value={form.status}
            >
              <option value="ACTIVE">Đang mở bán (ACTIVE)</option>
              <option value="OUT_OF_STOCK">Hết hàng (OUT_OF_STOCK)</option>
              <option value="DISCONTINUED">Ngừng kinh doanh (DISCONTINUED)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSubmit} color="green" disabled={loading} className="font-semibold">
              {loading ? "Đang lưu sản phẩm..." : "+ Tạo Sản Phẩm"}
            </Button>

            <Button variant="outlined" color="gray" onClick={() => navigate(-1)}>
              Hủy bỏ
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
